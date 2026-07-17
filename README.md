# TM Script Manager

**Version:** 2.0.0 · **Works on:** All sites · **Author:** THVjQ

One Tampermonkey install to rule them all. This manager finds and runs every THVjQ userscript directly from GitHub — no manual reinstalling, no hunting through repos, and no list to maintain. A slim pull-out tab on the right edge of your browser lets you toggle any script on or off instantly.

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for Chrome (or Firefox/Edge)
2. Open the file [`TM Script Manager`](TM%20Script%20Manager) in this repo and click **Raw**
3. Tampermonkey will detect the script — click **Install**
4. Done. The ⚡ tab will appear on the right edge of every page
5. Open the panel and hit **Scan** once to pull in the script list

> Installing this one script replaces installing each script individually. Scripts still auto-update from GitHub — you never need to reinstall anything.

---

## How to Use

**The pull tab** — a slim ⚡ strip sits on the right edge of your browser at all times. It turns red with a count when scripts are active on the current page. Click it to open the panel.

**The panel** opens to the left, with sections down the left-hand side:

| Section | What's in it |
|---------|-------------|
| SOSPOS | Scripts for app.sospos.com.au and related sites |
| Crazyparts | Scripts for crazyparts.com.au |
| Other | Everything else |

**Scan** — rebuilds the whole list from GitHub: finds newly published scripts, drops deleted ones, and reports any version bumps since the last scan. There is no hardcoded list; the panel is empty until you scan once.

**Toggles** — flip any script on or off. Changes apply on the next page load. Greyed-out rows aren't active on the page you're currently on.

---

## How Scripts Are Sorted

Each script declares its own section with a comment on **line 1** of its source, ahead of the `==UserScript==` block:

```js
// SOS
// ==UserScript==
// @name         SOS POS Auto Sort
...
```

| Line 1 | Section |
|--------|---------|
| `// SOS` | SOSPOS |
| `// CP` | Crazyparts |
| `// OTHER` | Other |
| *(missing)* | Other |

The tag sits before the metadata block, which Tampermonkey locates by scanning the file — so it has no effect on how the script installs or runs.

---

## Adding a New Script

1. Create the repo and push your script
2. Put `// SOS`, `// CP`, or `// OTHER` on line 1
3. Open the panel and hit **Scan**

That's it — no edit to this repo. The manager discovers it and it stays discovered.

---

## Notes

- **Discovery is by content, not filename.** Any file with a `==UserScript==` block counts, since names vary across the org (`.user.js`, plain `.js`, or no extension at all). The manager checks the predictable `{repo}/{branch}/{repo}.user.js` path first — which costs no API quota — and only falls back to the GitHub tree API when that misses. A full scan uses roughly 9 of the 60 unauthenticated calls/hour.
- The manager skips its own repo, plus forks and archived repos.
- Scripts are fetched from `https://raw.githubusercontent.com/THVjQ/{repo}/{branch}/` with a 5-minute cache.
- Toggle states and the discovered catalog persist via `GM_getValue` / `GM_setValue` across browser restarts.
- Scripts only execute on pages matching the `@match` / `@include` patterns in their own header.
- Requires Tampermonkey with `GM_xmlhttpRequest` permission. Because child scripts are `eval`'d inside the manager's sandbox, their own `@connect` rules are stripped — so the manager declares `@connect *` on their behalf (named hosts like `sosmessenger.thvjq.com.au` are also listed for documentation). Updating `@connect` triggers a one-time Tampermonkey re-approval prompt.
- The manager's API Keys tab has been removed. It stored keys under `__tmm_places_api_key__` / `__tmm_serpapi_key__`, which no script ever read — Google Reviews Smart Fetch keeps its own keys under `__grs_places_key__` / `__grs_serp_key__`, set via the ⚙ button in its review panel. Configure keys there.
