# Chrome Web Store Listing: Pounce

> Last Updated: 2026-09-11

## Store Listing

**Extension Name** [REQUIRED]
Pounce

**Short Description** [REQUIRED]
Clip the current tab as markdown for LLMs. Copy, save a file, or optionally send to Timothy.

**Detailed Description** [REQUIRED]
Pounce clips the current browser tab as markdown. When you click Pounce, it reads that tab on your device so you can copy the article for an LLM or save a .md file. If you connect your own Timothy instance, a Timothy icon appears and can send the clip there.

This is not a paywall or login bypass. Pounce only reads the page you already opened, after you ask it to clip.

FEATURES
• Clip the current page, or a selected passage, as markdown
• Copy for LLM (title, source URL, and markdown on the clipboard)
• Save as Markdown (download a .md file)
• Review and edit the markdown before you copy, save, or send
• Optional: send the clip to your Timothy knowledgebase
• Works on tabs you already have open, including sites you are signed into
• No analytics, no ads, no third-party services. Network only if you send to Timothy

HOW TO USE
1. Open the page you want, then click Pounce
2. Review the title and markdown
3. Click Copy for LLM or Save as Markdown
4. Optional: in Options, save your Timothy base URL and API token. A Timothy icon appears in the popup; click it to queue the clip

PRIVACY
Copy and save stay on this device. If you connect Timothy, Pounce stores the URL and API token on this device only (not synced). Website content is read only when you clip, and is sent only to your Timothy instance when you click the Timothy icon. Privacy policy: https://github.com/timothy-agent/pounce/blob/main/PRIVACY.md

PERMISSIONS
• Access the current tab when you click Pounce or use "Clip selection with Pounce". Needed to read the page you asked to clip.
• Store settings on this device. Needed if you connect Timothy (URL, token, default collection).
• Save a markdown file when you click Save as Markdown.
• Optional access to your Timothy site. Requested when you save Options, so Pounce can reach that instance only.

SUPPORT
Bugs and questions: https://github.com/timothy-agent/pounce/issues
Security reports: see https://github.com/timothy-agent/pounce/blob/main/SECURITY.md

Version 1.1.0. Clip as markdown for LLMs; Timothy send is optional.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Clips the current web page or a selected passage as markdown so the operator can copy it for an LLM or save it as a file.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `assets/brand/timothy-mark-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | popup with Copy for LLM and Save as Markdown |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | options page, Timothy optional |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | popup with Timothy icon when connected |
| Screenshot 4 | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 5 | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
1. Popup on a real article: title, markdown, Copy for LLM, Save as Markdown. No Timothy icon if not connected.
2. Options: Timothy as optional section, base URL, token field, Save / Test / Disconnect.
3. Same popup with Timothy connected: collection select, Timothy icon, copy/save still primary.

Do not show the API token. Do not use phone mockups.

Toolbar icons in the package: 16, 32, 48, 128 are exact pixel-grid marks.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `activeTab` | permissions | When the operator clicks Pounce or “Clip selection with Pounce”, the extension reads that tab’s article (or the selected text) so they can review markdown and copy, save, or send it. It does not run on other tabs. |
| `scripting` | permissions | Injects the clip extractor into the tab the operator just invoked, so Pounce can read the rendered page they asked to clip. |
| `storage` | permissions | Saves optional Timothy settings (base URL, API token, default collection) on this device (`chrome.storage.local`). Session storage holds a short-lived selection clip and a collections cache. Settings are not synced. |
| `contextMenus` | permissions | Adds “Clip selection with Pounce” on selected text so the operator can clip a passage instead of the whole page. |
| `downloads` | permissions | When the operator clicks Save as Markdown, writes the clip as a `.md` file using Chrome’s download UI. |
| `http://*/*` | host_permissions (optional) | Not granted at install. After the operator saves Timothy Options, Pounce requests access only to that origin so it can list collections and POST the clip. The optional pattern is broad because each operator’s Timothy URL is different. |
| `https://*/*` | host_permissions (optional) | Same as above for HTTPS Timothy instances (required for non-localhost). |

Do not add `tabs`. `tab.url` is read only after an `activeTab` user gesture (toolbar click or context menu).

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Website content is read on-device when the operator clips. Off-device transmission happens only if they connect Timothy and click the Timothy icon. Optional Timothy settings are stored locally.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | | |
| Health info | No | No | | |
| Financial info | No | No | | |
| Authentication info | Optional (API token, only if Timothy is connected) | Yes, only then. To the operator's Timothy URL only | Bearer token for the Timothy admin API | No (not to Pounce authors; only to the URL the operator configured) |
| Personal communications | No | No | | |
| Location | No | No | | |
| Web history | No | No | | |
| User activity | No | No | | |
| Website content | Yes (page URL, title, markdown of the clipped page or selection) | Only if the operator clicks the Timothy icon. To the operator's Timothy URL only | Copy/save on device; optional knowledgebase document | No |

Local only: Timothy base URL, API token, default collection id (`chrome.storage.local`, this device, not synced), if configured.

Not used: analytics, ads, `chrome.storage.sync`, remote scripts, CDNs.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

CWS disclosure checkboxes: website content; authentication only if Timothy is offered in the listing. Transmitted only to the operator-configured host when they send. Not sold. Not used for unrelated purposes.

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
| 1.1.0 | 2026-09-11 | Copy for LLM and Save as Markdown are primary. Timothy send is optional (icon, only when connected). Latest Timothy brand. | Draft |
| 1.0.0 | 2026-08-29 | First listing: clip page or selection, review markdown, send to Timothy | Draft |

## Program policy audit (2026-09-11)

Against https://developer.chrome.com/docs/webstore/program-policies/policies

| Policy | Status | Notes |
|--------|--------|--------|
| Single purpose / quality | Pass | Clip current tab or selection as markdown for copy/save; Timothy is an optional export |
| Minimum functionality | Pass | Copy and save work with no Timothy instance |
| Privacy policy | Pass once URL is public | `PRIVACY.md` + dashboard field |
| Limited Use statement | Pass | Verbatim sentence in `PRIVACY.md`; homepage README links it |
| In-product disclosure + consent | Pass | Options notice + first-save checkbox for Timothy; popup line about copy/save vs send |
| Browsing activity only for a featured feature | Pass | Clip is the product; no background scrape |
| Narrowest permissions | Pass with justification | `activeTab` not `tabs`; host perms optional, granted one origin at Save. `downloads` only for Save as Markdown |
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
5. Confirm copy, save, and (optional) `POST /v1/admin/kb/documents/clip` on an instance you can demo
6. `make build`, then zip **only** `dist/`
7. Load the ZIP unpacked: popup copy/save with no Options; selection menu; `chrome://` refusal; Options consent + save + host prompt; Timothy icon send
8. Prefer publish after review / deferred publish

### Known Issues / Limitations
- Context menu clip opens the popup when Chrome allows it; if the popup cannot open, the selection is kept briefly and applied the next time the popup opens. Failed extracts from the context menu are silent (no toast).
- `siteFromUrl` is unused in production (tests only); left in place.
- Worker, popup, and options are not unit-tested; they need a manual pass before submit.
- Remote code: none. All JS is in the package. Markdown preview disables raw HTML (`react-markdown` default).

### Rejection History
<!-- empty until first submit -->
