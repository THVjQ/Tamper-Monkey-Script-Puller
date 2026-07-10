// ─────────────────────────────────────────────────────────────────────────────
// Drive Script Manager – Background Service Worker
// ─────────────────────────────────────────────────────────────────────────────

const cache = {};  // in-memory URL → text cache

const driveURL = id =>
  `https://drive.google.com/uc?export=download&id=${id}`;

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchText(url) {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const text = await res.text();
  // Bail if Drive returned an HTML warning page instead of the file
  if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
    throw new Error(`Got HTML instead of file content. Is the file shared publicly?`);
  }
  cache[url] = text;
  return text;
}

function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}

// ── Manifest loading ──────────────────────────────────────────────────────────

async function getScripts() {
  const { manifestId } = await chrome.storage.sync.get('manifestId');
  if (!manifestId) return [];
  try {
    const text = await fetchText(driveURL(manifestId));
    return JSON.parse(text);   // expects an array of { name, fileId, description? }
  } catch (e) {
    console.error('[DSM] Failed to load manifest:', e.message);
    return [];
  }
}

// ── GM polyfills (injected before each script) ────────────────────────────────

const GM_SHIM = `
(function() {
  if (typeof window.__DSM_SHIM__ !== 'undefined') return;
  window.__DSM_SHIM__ = true;

  window.unsafeWindow = window;
  window.GM_log = (...a) => console.log('[GM]', ...a);

  window.GM_addStyle = function(css) {
    const s = document.createElement('style');
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  };

  window.GM_setValue = function(key, value) {
    try { localStorage.setItem('__gm__' + key, JSON.stringify(value)); } catch {}
  };
  window.GM_getValue = function(key, defaultValue) {
    try {
      const raw = localStorage.getItem('__gm__' + key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch { return defaultValue; }
  };
  window.GM_deleteValue = function(key) {
    try { localStorage.removeItem('__gm__' + key); } catch {}
  };

  window.GM_xmlhttpRequest = function(opts) {
    fetch(opts.url, {
      method: opts.method || 'GET',
      headers: opts.headers || {},
      body: opts.data || undefined,
    })
      .then(async r => {
        const text = await r.text();
        if (opts.onload) opts.onload({ status: r.status, responseText: text, response: text });
      })
      .catch(e => { if (opts.onerror) opts.onerror(e); });
  };

  window.GM_openInTab = function(url) { window.open(url, '_blank'); };
  window.GM_setClipboard = function(text) { navigator.clipboard?.writeText(text); };
})();
`;

// Strip ==UserScript== header block if present
function stripHeader(code) {
  return code.replace(/\/\/\s*==UserScript==[\s\S]*?\/\/\s*==\/UserScript==/m, '').trim();
}

// ── Inject scripts into a tab ─────────────────────────────────────────────────

async function runScriptsForTab(tabId) {
  const scripts = await getScripts();
  if (!scripts.length) return;

  const { enabledScripts = {}, apiKeys = {} } = await chrome.storage.sync.get(['enabledScripts', 'apiKeys']);

  for (const s of scripts) {
    if (enabledScripts[s.name] === false) {
      console.log(`[DSM] Skipping (disabled): ${s.name}`);
      continue;
    }
    try {
      const raw      = await fetchText(driveURL(s.fileId));
      const code     = stripHeader(raw);
      const keyValue = s.apiKeyName ? (apiKeys[s.apiKeyName] || '') : null;

      await chrome.scripting.executeScript({
        target: { tabId },
        world : 'MAIN',
        func  : (shim, scriptCode, scriptName, apiKeyValue) => {
          try {
            const el = document.createElement('script');
            let prefix = shim + '\n;';
            if (apiKeyValue !== null) {
              prefix += '\nwindow.__DSM_API_KEY__ = ' + JSON.stringify(apiKeyValue) + ';';
            }
            el.textContent = prefix + '\n' + scriptCode;
            (document.head || document.documentElement).appendChild(el);
            el.remove();
          } catch (e) {
            console.error('[DSM] Error injecting "' + scriptName + '":', e);
          }
        },
        args: [GM_SHIM, code, s.name, keyValue],
      });

      console.log(`[DSM] Ran: ${s.name}`);
    } catch (e) {
      console.error(`[DSM] Could not run "${s.name}":`, e.message);
    }
  }
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'RUN_SCRIPTS':
      if (sender.tab?.id) runScriptsForTab(sender.tab.id);
      break;

    case 'FETCH_MANIFEST':
      // Popup asks background to fetch & return the manifest
      getScripts().then(scripts => sendResponse({ scripts }));
      return true;   // keeps the channel open for async response

    case 'CLEAR_CACHE':
      clearCache();
      sendResponse({ ok: true });
      break;
  }
});
