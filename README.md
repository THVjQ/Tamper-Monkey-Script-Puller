# Tamper Monkey Script Puller (TM Script Manager)

**Version:** 1.2.0 · **Site:** All sites

> **⚠ Do not use v1 — it has major issues. v1.2.0 is available in this repo.**

A master script manager that loads and runs all THVjQ custom scripts directly from GitHub. One install gives you a floating control panel to toggle any script on or off — no manual reinstalling when scripts update.

---

## What It Does

- **Pulls scripts live from GitHub** (`raw.githubusercontent.com/THVjQ/...`) on every page load
- **Floating toggle panel** — enable or disable any script without reinstalling
- **Shared API key storage** — enter your Google Places and SerpAPI keys once; all scripts that need them read them automatically
- **Auto-updates** — scripts always run from the latest commit on GitHub's `main` branch

---

## Scripts Managed

### CrazyParts
| Script | Repo |
|--------|------|
| CrazyParts Anti-Idle | `crazyparts-anti-idle` |
| Crazyparts Quick Nav | `crazyparts-quick-nav` |
| Crazyparts Mix Cart Addon | `crazyparts-mix-cart-addon` |

### SOS POS
| Script | Repo |
|--------|------|
| Ticket PIN Copy | `sos-pos-ticket-pin-copy` |
| Auto Move | `sos-pos-auto-move` |
| Auto Sort | `sos-pos-auto-sort` |
| Enlarge | `sos-pos-enlarge` |
| Bulk Uploader | `sos-pos-bulk-uploader` |
| SMS Sender | `sos-sms-sender` |
| Booking Checker | `sos-booking-checker` |
| Google Reviews (Smart Fetch) | `SOSPOS-Google-REview-Smart-Fetch` |

---

## Shared API Keys

Enter keys once in the **API Keys** panel — all scripts share them automatically:

| Key | Storage ID | Used By |
|-----|-----------|---------|
| Google Places API Key | `__tmm_places_api_key__` | Google Review scripts |
| SerpAPI Key | `__tmm_serpapi_key__` | Google Review scripts |

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) in Chrome
2. Click **Raw** on the `.user.js` file in this repo — **make sure it is v1.2.0 or higher**
3. Tampermonkey will prompt to install — click **Install**
4. Visit any page — the toggle panel appears
5. Enter your API keys in the **API Keys** section
6. Toggle the scripts you want active

> Installing this one script replaces installing each script individually. Individual `.user.js` files from the other repos still work standalone if preferred.

---

## Notes

- Scripts load from `https://raw.githubusercontent.com/THVjQ/{repo}/main/{repo}.user.js`
- Toggle states are stored via `GM_setValue` and persist across browser restarts
- Requires `GM_xmlhttpRequest` with `@connect raw.githubusercontent.com`
