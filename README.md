# Pounce

Official browser extension for [Timothy](https://github.com/timothy-agent/timothy).
Clip the page you are reading into your Timothy knowledgebase: Pounce extracts the
article from the rendered DOM, converts it to markdown in your browser, and sends it
to your own Timothy instance.

Because extraction happens in your browser, Pounce can clip the tab you already
have open: signed-in sites and JavaScript-rendered pages. It does not bypass
logins or paywalls. It only reads the page you asked to clip.

> Requires a Timothy instance with the admin knowledgebase APIs below.

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

## Timothy API

Pounce calls only the Timothy base URL you configure. Every request includes
`Authorization: Bearer <token>`. JSON errors look like
`{ "error": "<code>", "message": "<text>" }`.

### `GET /v1/admin/kb/collections`

Returns `{ "collections": [ { "id", "name", ... } ] }`. Used for the collection
picker on Options and in the popup.

### `POST /v1/admin/kb/documents/clip`

```json
{
  "url": "https://example.com/article",
  "title": "",
  "markdown": "# Heading\n\n…"
}
```

- `url` (required) — `http` or `https`. Fragment and tracking params (`utm_*`,
  `fbclid`, `gclid`) are stripped before send.
- `markdown` (required) — non-empty, at most 128 KiB UTF-8.
- `title` — optional; empty string is allowed.
- `collection_id` — optional. Sent only when you pick a collection; omitted so
  Timothy can auto-classify.

A successful clip is **202 Accepted** with the document JSON (markdown omitted).
Ingest continues on the server. Pounce links to
`{baseUrl}/knowledge/{collection_id}`.

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting process.

See [PRIVACY.md](PRIVACY.md) for what Pounce stores and sends.

The API token never enters the page. Content scripts are injected only when you clip.
Clipped HTML is converted to markdown in the isolated world and rendered in the popup
with raw HTML disabled.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[AGPL-3.0](LICENSE)
