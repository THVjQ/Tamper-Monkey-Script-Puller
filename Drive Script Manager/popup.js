// ─────────────────────────────────────────────────────────────────────────────
// Drive Script Manager – Popup
// ─────────────────────────────────────────────────────────────────────────────

// ── DOM refs ──────────────────────────────────────────────────────────────────
const setupScreen     = document.getElementById('setup-screen');
const mainScreen      = document.getElementById('main-screen');
const loadingScreen   = document.getElementById('loading-screen');
const manifestInput   = document.getElementById('manifest-input');
const saveManifestBtn = document.getElementById('save-manifest-btn');
const settingsBtn     = document.getElementById('settings-btn');
const scriptList      = document.getElementById('script-list');
const apiKeyList      = document.getElementById('apikey-list');
const statusMsg       = document.getElementById('status-msg');
const allOnBtn        = document.getElementById('all-on-btn');
const allOffBtn       = document.getElementById('all-off-btn');
const scanBtn         = document.getElementById('scan-btn');

// ── State ─────────────────────────────────────────────────────────────────────
let scripts        = [];
let enabledScripts = {};
let apiKeys        = {};
let manifestId     = '';

// ── Helpers ───────────────────────────────────────────────────────────────────
function showScreen(name) {
  [setupScreen, mainScreen, loadingScreen].forEach(s => s.classList.add('hidden'));
  if (name === 'setup')   setupScreen.classList.remove('hidden');
  if (name === 'main')    mainScreen.classList.remove('hidden');
  if (name === 'loading') loadingScreen.classList.remove('hidden');
}

function setStatus(text, type = '') {
  statusMsg.textContent = text;
  statusMsg.className   = 'status-msg' + (type ? ' ' + type : '');
}

function saveEnabled() { chrome.storage.sync.set({ enabledScripts }); }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

// ── Render: scripts tab ───────────────────────────────────────────────────────
function renderList() {
  if (!scripts.length) {
    scriptList.innerHTML = '<p class="empty-msg">No scripts found in manifest.<br>Check the file ID or scan again.</p>';
    return;
  }

  scriptList.innerHTML = '';

  // Group scripts by category, preserving manifest order
  const groups = [];
  const buckets = {};
  for (const s of scripts) {
    const cat = s.category || 'SCRIPTS';
    if (!buckets[cat]) { buckets[cat] = []; groups.push({ cat, items: buckets[cat] }); }
    buckets[cat].push(s);
  }

  groups.forEach(({ cat, items }, gi) => {
    const hdr = document.createElement('div');
    hdr.className = 'cat-header' + (gi === 0 ? ' first' : '');
    hdr.textContent = cat;
    scriptList.appendChild(hdr);

    items.forEach(s => {
      const isOn = enabledScripts[s.name] !== false;

      const row = document.createElement('div');
      row.className = 'script-row';
      row.innerHTML = `
        <div class="script-info">
          <div class="script-name" title="${escHtml(s.name)}">${escHtml(s.name)}</div>
          ${s.description ? `<div class="script-desc">${escHtml(s.description)}</div>` : ''}
          ${s.apiKeyName ? `<div class="script-apikey">★ API key required — set in API Keys tab</div>` : ''}
        </div>
        <label class="toggle">
          <input type="checkbox" ${isOn ? 'checked' : ''} data-name="${escHtml(s.name)}">
          <span class="toggle-track"></span>
        </label>`;

      row.querySelector('input').addEventListener('change', e => {
        enabledScripts[e.target.dataset.name] = e.target.checked;
        saveEnabled();
        setStatus('Saved · applies on next page load');
      });

      scriptList.appendChild(row);
    });
  });
}

// ── Render: API keys tab ──────────────────────────────────────────────────────
function renderApiKeys() {
  const needed = [...new Set(scripts.filter(s => s.apiKeyName).map(s => s.apiKeyName))];

  if (!needed.length) {
    apiKeyList.innerHTML = '<p class="empty-msg">No API keys required by your current scripts.</p>';
    return;
  }

  apiKeyList.innerHTML = '';
  needed.forEach(keyName => {
    const row = document.createElement('div');
    row.className = 'apikey-row';
    row.innerHTML = `
      <label class="apikey-label">${escHtml(keyName)}</label>
      <div class="apikey-input-row">
        <input type="password" class="text-input" placeholder="Paste key…" value="${escHtml(apiKeys[keyName] || '')}">
        <button class="btn btn-sm save-key-btn">Save</button>
      </div>`;

    row.querySelector('.save-key-btn').addEventListener('click', e => {
      const val = row.querySelector('input').value.trim();
      apiKeys[keyName] = val;
      chrome.storage.sync.set({ apiKeys });
      e.target.textContent = '✓ Saved';
      setTimeout(() => e.target.textContent = 'Save', 1800);
    });

    apiKeyList.appendChild(row);
  });
}

// ── Load manifest via background ──────────────────────────────────────────────
function loadManifest() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'FETCH_MANIFEST' }, res => {
      resolve(res?.scripts ?? []);
    });
  });
}

async function refresh(clearCacheFirst = false) {
  showScreen('loading');
  setStatus('');

  if (clearCacheFirst) {
    await new Promise(r => chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' }, r));
  }

  scripts = await loadManifest();
  showScreen('main');
  renderList();
  renderApiKeys();

  const count = scripts.length;
  setStatus(
    count ? `${count} script${count !== 1 ? 's' : ''} loaded · changes apply on next page load` : 'No scripts found.',
    count ? '' : 'error'
  );
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const stored = await chrome.storage.sync.get(['manifestId', 'enabledScripts', 'apiKeys']);
  manifestId     = stored.manifestId     || '';
  enabledScripts = stored.enabledScripts || {};
  apiKeys        = stored.apiKeys        || {};

  if (!manifestId) { showScreen('setup'); return; }
  await refresh();
}

// ── Events ────────────────────────────────────────────────────────────────────
saveManifestBtn.addEventListener('click', async () => {
  const val = manifestInput.value.trim();
  if (!val) { manifestInput.focus(); return; }
  const match = val.match(/[-\w]{25,}/);
  manifestId = match ? match[0] : val;
  await chrome.storage.sync.set({ manifestId });
  await refresh(true);
});

manifestInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveManifestBtn.click();
});

settingsBtn.addEventListener('click', () => {
  const newId = prompt('Paste new manifest.json Google Drive file ID (or full URL):', manifestId);
  if (!newId) return;
  const match = newId.trim().match(/[-\w]{25,}/);
  const parsed = match ? match[0] : newId.trim();
  if (!parsed) return;
  manifestId = parsed;
  chrome.storage.sync.set({ manifestId });
  refresh(true);
});

scanBtn.addEventListener('click', () => refresh(true));

allOnBtn.addEventListener('click', () => {
  scripts.forEach(s => { enabledScripts[s.name] = true; });
  saveEnabled();
  renderList();
  setStatus('All scripts enabled · applies on next page load');
});

allOffBtn.addEventListener('click', () => {
  scripts.forEach(s => { enabledScripts[s.name] = false; });
  saveEnabled();
  renderList();
  setStatus('All scripts disabled · applies on next page load');
});

init();
