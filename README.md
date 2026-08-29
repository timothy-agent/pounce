# Pounce

Official browser extension for [Timothy](https://github.com/timothy-agent/timothy).
Clip the page you are reading into your Timothy knowledgebase: Pounce extracts the
article from the rendered DOM, converts it to markdown in your browser, and sends it
to your own Timothy instance.

Because extraction happens in your browser, Pounce can clip the tab you already
have open: signed-in sites and JavaScript-rendered pages. It does not bypass
logins or paywalls. It only reads the page you asked to clip.

> Status: early development. Requires a Timothy instance that implements
> `POST /v1/admin/kb/documents/clip` (see below).

## How it works

1. Click the Pounce button (or clip a selection via the context menu).
2. Review and edit the extracted markdown, pick a collection (or leave auto-classify).
3. Send. The document lands in your Timothy knowledgebase and is indexed for retrieval.

All requests go to the Timothy base URL you configure. No third-party services, no
analytics, no external requests at runtime.

## Requirements

- A running [Timothy](https://github.com/timothy-agent/timothy) instance
- Chrome (Manifest V3); Firefox 128+ should load the same bundle, untested

## Installation

The toolchain is Docker-only. From this repo:

```
make install
make build
```

Then in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select the
`dist/` directory this build produced.

## Configuration

Options page (right-click the icon → Options, or the Options link in the popup):

- **Timothy base URL** — the URL you open Timothy in. Must serve `/v1/admin`. HTTPS
  except localhost.
- **API token** — the same admin bearer token (`TIMOTHY_API_TOKEN`). Stored in
  `chrome.storage.local` on this device only; never synced.
- **Default collection** — a specific collection, or auto-classify.

Saving the base URL prompts for host permission to that origin only.

## Development

```
make install   # npm install in node:24.18.0-alpine
make test
make lint
make build
make dev       # Vite HMR; still load the unpacked extension from dist/ after build
```

No host Node install. Named Docker volumes cache `node_modules` and the npm cache.

## Timothy API this extension calls

Auth on every request: `Authorization: Bearer <token>`.

JSON errors are `{ "error": "<code>", "message": "<text>" }` (existing brain shape).

### Already exists

`GET /v1/admin/kb/collections` → `{ "collections": [ { "id", "name", ... } ] }`

Used to fill the collection picker.

### Needed

`POST /v1/admin/kb/documents/clip`

```json
{
  "url": "https://example.com/article",
  "markdown": "# Article title\n\n..."
}
```

- `title` is optional and may be `""`. Pounce sends the popup value as-is (extracted title, or empty if the operator cleared it).
- `collection_id` is optional. Omit it (the usual case) and Timothy classifies the
  document itself. Send a UUID only when the operator picked a collection in the popup.
- `url` is http(s), fragment and `utm_*` / `fbclid` / `gclid` already stripped client-side.
- `markdown` is non-empty. The popup refuses payloads above **128 KiB** UTF-8 (same cap
  as Timothy's `TruncateMarkdown`). Oversize should also 413 from the server.
- Response: **202 Accepted** plus the document JSON (markdown omitted). Ingest is
  queued; the popup does not wait for it. Link: `{baseUrl}/knowledge/{collection_id}`.

Re-clip, collection assignment, ingest: all server-side. The extension only sends the
payload above.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting process.

See [PRIVACY.md](PRIVACY.md) for what Pounce stores and sends (required for Chrome Web Store listing).

The API token never enters the page. Content scripts are injected only when you clip.
Clipped HTML is converted to markdown in the isolated world and rendered in the popup
with raw HTML disabled.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[AGPL-3.0](LICENSE)
