# Privacy Policy for Pounce

Last updated: 2026-08-29

Pounce is a Chrome extension that clips the current browser tab (or a selected passage) into the Timothy knowledgebase the operator configures. Pounce is published by the Timothy project. It is not a Google product.

## Limited Use

The use of information received from Google APIs will adhere to the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), including the Limited Use requirements.

Pounce does not call Google APIs. Page content and the API token are used only to provide the single purpose of clipping into the operator’s own Timothy instance. They are not sold, not used for advertising, not used to determine credit-worthiness, and not transferred to anyone other than the Timothy URL the operator saved (or as required by law).

## What data is handled

### Stored on this device only

These stay in Chrome’s local extension storage on the device. They are not synced through a Google account.

- Timothy base URL
- API token (`TIMOTHY_API_TOKEN` equivalent)
- Default collection id (optional)

### Read from the current tab, only when you clip

When you click Pounce or choose “Clip selection to Timothy”, Pounce reads that tab to build a clip:

- Page URL (fragment and common tracking parameters stripped)
- Title (optional; you may clear it)
- Markdown converted from the page or from your selection
- Image count (derived from the markdown; images stay as links)

Pounce does not run on other tabs, does not record browsing history, and does not scrape the web in the background.

### Sent off the device

Only to the Timothy base URL you saved, over HTTPS (HTTP is allowed only for localhost):

- `GET /v1/admin/kb/collections`: list collections (uses the token)
- `POST /v1/admin/kb/documents/clip`: URL, title, markdown, optional collection id (uses the token)

Nothing is sent until you save Options (token + URL) and later click **Send to Timothy**. Extraction in the popup stays on the device until Send.

## Who data is shared with

- **Pounce authors:** we do not receive your clips, token, or browsing data. The extension does not include analytics.
- **Timothy instance you named:** receives the clip you send, using your token. That instance’s own privacy practices apply to documents after ingest.
- **Google:** settings use `chrome.storage.local` only (not `chrome.storage.sync`), so this data is not sent to Google for sync. Chrome Web Store listing, payments, and reviews are governed by Google’s policies.
- **Advertisers / data brokers:** none.

## How data is used

Sole purpose: let you clip a page you are looking at into your Timothy knowledgebase. No other use.

## Security

- Token never enters the page. Content scripts run only on the tab you invoked.
- Remote Timothy URLs must be HTTPS.
- Clipped HTML is converted to markdown before preview; raw HTML is not executed in the popup.

## Retention and deletion

- Uninstalling Pounce removes local settings from the device.
- Documents already stored in Timothy remain until you delete them there.

## User controls

- Change or clear the token and URL on the Options page.
- Review and edit markdown before Send.
- Revoke host access in `chrome://extensions` → Pounce → Site access.

## Changes

If data practices change, this policy and the in-extension disclosure will be updated. Continued use after an update that introduces new practices will require a new in-product acknowledgment.

## Contact

Privacy questions: [sumonmselim@gmail.com](mailto:sumonmselim@gmail.com)

Support: [github.com/timothy-agent/pounce/issues](https://github.com/timothy-agent/pounce/issues)

Security reports: [SECURITY.md](SECURITY.md)
