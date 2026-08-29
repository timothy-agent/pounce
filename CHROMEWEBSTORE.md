# Chrome Web Store Listing — Pounce

> Last Updated: 2026-08-29

## Store Listing

**Extension Name** [REQUIRED]
Pounce

**Short Description** [REQUIRED]
Clip the current tab into your own Timothy knowledgebase. Review the markdown, then send it to the URL you configure.

**Detailed Description** [REQUIRED]
Pounce clips the current browser tab into your own Timothy knowledgebase. When you click Pounce, it reads that tab on your device. When you click Send, it transmits the page URL, title, and markdown only to the Timothy URL you saved.

This is not a paywall or login bypass. Pounce only reads the page you already opened, after you ask it to clip.

FEATURES
• Clip the current page, or a selected passage, into Timothy
• Review and edit the markdown before anything is sent
• Choose a collection, or let Timothy auto-classify
• Works on tabs you already have open, including sites you are signed into
• Talks only to your Timothy URL. No analytics, no ads, no third-party services

HOW TO USE
1. Open Options, read the data notice, agree, and save your Timothy base URL and API token
2. Open the page you want, then click Pounce
3. Review the title, collection, and markdown
4. Send to Timothy. Ingestion is queued on your instance

PRIVACY
Pounce stores the Timothy URL and API token on this device only (not synced). It does not record browsing history. Website content is read only when you clip, and is sent only to your Timothy instance when you click Send. Privacy policy: https://github.com/timothy-agent/pounce/blob/main/PRIVACY.md

PERMISSIONS
• Access the current tab when you click Pounce or use “Clip selection to Timothy” — needed to read the page you asked to clip
• Store settings on this device — needed for the Timothy URL, token, and default collection
• Optional access to your Timothy site — requested when you save Options, so Pounce can reach that instance only

SUPPORT
Bugs and questions: https://github.com/timothy-agent/pounce/issues
Security reports: see https://github.com/timothy-agent/pounce/blob/main/SECURITY.md

Version 1.0.0 — first public listing.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Clips the current web page or a selected passage into the operator’s Timothy knowledgebase.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `assets/brand/timothy-mark-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | popup clipping a page |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | options page with connection status |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | success after send, knowledgebase link |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 5 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
1. Popup on a real article: title, collection, markdown, green connection dot, Send to Timothy.
2. Options: base URL, token field, default collection, Test connection, status notices.
3. Success notice after queueing, with Open in knowledgebase.

Do not show the API token. Do not use phone mockups.

Toolbar icons in the package: 16, 32, 128 are exact. Manifest `48` currently points at the 64px PNG (`timothy-mark-64.png`). Chrome downscales it; add a true 48×48 before submit if review flags it.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | When the operator clicks Pounce or “Clip selection to Timothy”, the extension reads that tab’s article (or the selected text) so they can review markdown and send it to Timothy. It does not run on other tabs. |
| `scripting` | permissions | Injects the clip extractor into the tab the operator just invoked, so Pounce can read the rendered page they asked to clip. |
| `storage` | permissions | Saves the Timothy base URL, API token, and default collection on this device (`chrome.storage.local`). Session storage holds a short-lived selection clip and a collections cache. Settings are not synced. |
| `contextMenus` | permissions | Adds “Clip selection to Timothy” on selected text so the operator can clip a passage instead of the whole page. |
| `http://*/*` | host_permissions (optional) | Not granted at install. After the operator saves Options, Pounce requests access only to that Timothy origin so it can list collections and POST the clip. The optional pattern is broad because each operator’s Timothy URL is different. |
| `https://*/*` | host_permissions (optional) | Same as above for HTTPS Timothy instances (required for non-localhost). |

Do not add `tabs`. `tab.url` is read only after an `activeTab` user gesture (toolbar click or context menu).

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes — only what the operator sends to their own Timothy instance, plus settings stored locally.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | | |
| Health info | No | No | | |
| Financial info | No | No | | |
| Authentication info | Yes (API token) | Yes — to the operator’s Timothy URL only | Bearer token for the Timothy admin API | No (not to Pounce authors; only to the URL the operator configured) |
| Personal communications | No | No | | |
| Location | No | No | | |
| Web history | No | No | | |
| User activity | No | No | | |
| Website content | Yes (page URL, title, markdown of the clipped page or selection) | Yes — to the operator’s Timothy URL only | Create a knowledgebase document | No |

Local only: Timothy base URL, API token, default collection id (`chrome.storage.local`, this device, not synced).

Not used: analytics, ads, `chrome.storage.sync`, remote scripts, CDNs.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

CWS disclosure checkboxes: user activity / website content / authentication — transmitted only to the operator-configured host. Not sold. Not used for unrelated purposes.

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/timothy-agent/pounce/blob/main/PRIVACY.md

Source of truth in-repo: `PRIVACY.md`. Must be on the default branch of a **public** repo (or host the same text on GitHub Pages). The dashboard link must load without login. Includes the Limited Use sentence required by CWS.

## Distribution

**Visibility**: Public (or Unlisted for a first private test)
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
Timothy (or the Chrome Web Store publisher account that owns timothy-agent)

**Contact Email** [REQUIRED]
sumonmselim@gmail.com

**Support URL / Email** [RECOMMENDED]
https://github.com/timothy-agent/pounce/issues

**Homepage URL** [RECOMMENDED]
https://github.com/timothy-agent/pounce

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-08-29 | First listing: clip page or selection, review markdown, send to Timothy | Draft |

## Program policy audit (2026-08-29)

Against https://developer.chrome.com/docs/webstore/program-policies/policies

| Policy | Status | Notes |
|--------|--------|--------|
| Single purpose / quality | Pass | Clip current tab or selection into operator Timothy |
| Minimum functionality | Pass if Timothy clip API is live | Dead API = broken product; do not submit until a real instance works |
| Privacy policy | Pass once URL is public | `PRIVACY.md` + dashboard field |
| Limited Use statement | Pass | Verbatim sentence in `PRIVACY.md`; homepage README links it |
| In-product disclosure + consent | Pass | Options notice + first-save checkbox; popup Send notice. Store listing alone is not enough (User Data FAQ #10) |
| Browsing activity only for a featured feature | Pass | Clip is the product; no background scrape |
| Narrowest permissions | Pass with justification | `activeTab` not `tabs`; host perms optional, granted one origin at Save. `http://*/*` + `https://*/*` optional exist so any self-hosted URL (incl. localhost ports) can be requested |
| HTTPS for user data in transit | Pass | `normalizeBaseUrl` requires HTTPS except localhost |
| No remote code / MV3 | Pass | Bundled JS only; `build.sourcemap: false`; minify allowed |
| No paywall circumvention | Pass | Copy and UI state we only read the open tab; do not advertise paywall bypass |
| No malware / crypto / gambling / hate | Pass | N/A |
| Impersonation | Pass | Do not claim Google or Chrome endorsement. Publisher is Timothy |
| Ads / affiliate | Pass | None |
| Listing completeness | Blocked | Screenshots still required; privacy URL must 200 |
| Keyword spam / testimonials | Pass | Listing copy is functional |
| Code readability | Pass | Vite minify, no obfuscation |
| 2-Step Verification | Account | Enable on the Google account before first upload |
| Meaningful support | Pass | GitHub issues + email in SECURITY.md |
| Accurate metadata / data disclosure | Operator | Dashboard checkboxes must match the table above |

### Pre-submit (this repo)

1. Enable **2-Step Verification** on the Chrome Web Store Google account (required to publish)
2. Push `PRIVACY.md` to the public default branch; open the URL in a private window
3. Dashboard privacy policy field = that URL; data-use form matches this file
4. Capture 1280×800 (or 640×400) screenshots of popup + options; token must not appear
5. Confirm `POST /v1/admin/kb/documents/clip` works on an instance you can demo
6. `make build`, then zip **only** `dist/`
7. Load the ZIP unpacked: Options consent + save + host prompt, popup on https, selection menu, `chrome://` refusal, Send
8. Prefer publish after review / deferred publish

### Known Issues / Limitations
- Context menu clip opens the popup when Chrome allows it; if the popup cannot open, the selection is kept briefly and applied the next time the popup opens. Failed extracts from the context menu are silent (no toast).
- Manifest action icon 48 uses the 64px PNG.
- `siteFromUrl` is unused in production (tests only); left in place.
- Worker, popup, and options are not unit-tested; they need a manual pass before submit.
- Remote code: none. All JS is in the package. Markdown preview disables raw HTML (`react-markdown` default).

### Rejection History
<!-- empty until first submit -->
