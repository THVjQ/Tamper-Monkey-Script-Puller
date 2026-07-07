# TM Script Manager

**Version:** 2.2.0 · **Works on:** All sites · **Author:** THVjQ

One Tampermonkey install to rule them all. This manager pulls and runs every THVjQ custom script directly from GitHub — no manual reinstalling, no hunting through repos. A slim pull-out tab on the right edge of your browser lets you toggle any script on or off instantly.

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for Chrome (or Firefox/Edge)
2. Open the file [`TM Script Manager`](TM%20Script%20Manager) in this repo and click **Raw**
3. Tampermonkey will detect the script — click **Install**
4. Done. The ⚡ tab will appear on the right edge of every page

> Installing this one script replaces installing each script individually. Scripts still auto-update from GitHub — you never need to reinstall anything.

---

## How to Use

**The pull tab** — a slim blue ⚡ strip sits on the right edge of your browser at all times. Click it to open the panel.

**The panel** opens to the left and has three sections:

| Section | What's in it |
|---------|-------------|
| 🔧 CrazyParts | Scripts for crazyparts.com.au |
| 📱 SOSPOS | Scripts for app.sospos.com.au and related sites |
| 🌐 Other | Universal scripts that work everywhere |

**Toggles** — flip any script on or off. Changes apply on the next page load.

**Edit mode** — click **Edit** in the panel header to reveal a ✕ button on each script. Click ✕ to permanently hide a script you never want to see. A "Restore all hidden" link appears if you hide everything in a category.

**NEW badge** — any newly added script shows a green NEW chip for 7 days, plus a green dot on the pull tab so you know something's been added.

**Copy TM Snippet** — button in the footer copies a ready-to-use boilerplate for writing a new Tampermonkey script in the same style.

---

## Scripts Managed

### 🔧 CrazyParts
| Script | What it does |
|--------|-------------|
| UI Customiser | Rebuilds the old CrazyParts category menu on the new site with a searchable 3-column grid and Edit mode |
| Anti-Idle | Keeps your CrazyParts session alive so you don't get logged out |
| Quick Nav | Adds keyboard shortcuts and fast navigation across CrazyParts |
| Mix Cart Addon | Allows mixing parts from different categories into a single cart |

### 📱 SOSPOS
| Script | What it does |
|--------|-------------|
| Ticket PIN Copy | One-click copy of ticket PINs inside SOS POS |
| Auto Move | Automatically moves tickets between stages based on rules |
| Auto Sort | Sorts the ticket list automatically |
| Enlarge | Enlarges small UI elements in SOS POS for easier reading |
| Bulk Uploader | Upload multiple items to SOS POS at once |
| Google Review Timer | Shows a countdown in the SOS POS nav for the next review check |
| Google Review Smart Fetch | Displays live Google review count and newest reviews inside SOS POS — uses Places API (free, hourly) and SerpAPI (only on new review). Configure keys via the ⚙ button in the review panel |
| Sydney Microsoldering | Bridges SOS POS tickets to the Sydney Microsoldering support portal |
| SMS Sender | Send SMS from SOS POS via Google Messages |
| Booking Checker | Checks webmail for new bookings and flags them inside SOS POS |

### 🌐 Other
| Script | What it does |
|--------|-------------|
| Price & Labour Calculator | Floating calculator for pricing repairs and parts — works on any site |

---

## Adding a New Script

1. Create your new repo with a `.user.js` file (or use the **Copy TM Snippet** button in the panel to get a boilerplate)
2. Open `TM Script Manager` in this repo and add one entry to the `SCRIPTS` array:

```js
{
  id:        'your-script-id',
  name:      'Display Name',
  category:  'CrazyParts',  // or 'SOSPOS' or 'Other'
  url:       `${GH}/your-repo-name/main/your-script.user.js`,
  matches:   ['https://example.com/*'],
  addedDate: '2026-06-16',  // shows NEW badge for 7 days
},
```

3. Commit and push — the manager picks it up on the next page load for all users

---

## Notes

- Scripts are fetched from `https://raw.githubusercontent.com/THVjQ/{repo}/main/` with a 5-minute cache
- Toggle states and hidden scripts persist via `GM_getValue` / `GM_setValue` across browser restarts
- Scripts only execute on pages that match their `@match` patterns — the blue dot in the panel turns grey when a script isn't active on the current page
- Requires Tampermonkey with `GM_xmlhttpRequest` permission. Because child scripts are `eval`'d inside the manager's sandbox, their own `@connect` rules are stripped — so the manager declares `@connect *` on their behalf (named hosts like `sosmessenger.thvjq.com.au` are also listed for documentation). Updating `@connect` triggers a one-time Tampermonkey re-approval prompt.
