// Notify the background service worker that a page has loaded.
// The background will fetch & inject any enabled scripts.
chrome.runtime.sendMessage({ type: 'RUN_SCRIPTS' });
