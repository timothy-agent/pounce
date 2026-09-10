# Pounce

Clip the page you are reading as markdown: Pounce extracts the article from the
rendered DOM, converts it in your browser, then lets you copy it for an LLM or
save it as a `.md` file. Sending to [Timothy](https://github.com/timothy-agent/timothy)
is optional.

Because extraction happens in your browser, Pounce can clip the tab you already
have open: signed-in sites and JavaScript-rendered pages. It does not bypass
logins or paywalls. It only reads the page you asked to clip.

## How it works

1. Click the Pounce button (or clip a selection via the context menu).
2. Review and edit the extracted markdown.
3. **Copy for LLM** puts title, source URL, and markdown on the clipboard.
   **Save as Markdown** downloads a `.md` file.
4. If you have connected Timothy, a Timothy icon appears. Click it to queue the
   clip in your knowledgebase.

Copy and save stay on this device. The only network request Pounce makes is to
the Timothy base URL you configure, and only when you click the Timothy icon.
No analytics, no third-party services.

## Requirements

- Chrome (Manifest V3); Firefox 128+ should load the same bundle, untested
- Optional: a running [Timothy](https://github.com/timothy-agent/timothy) instance

## Installation

The toolchain is Docker-only. From this repo:

```
make install
make build
```

Then in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select the
`dist/` directory this build produced.

## Configuration

Options are optional. Copy and save work with no setup.

To send clips to Timothy (right-click the icon → Options):

- **Timothy base URL.** The URL you open Timothy in. HTTPS except localhost.
- **API token.** The same admin bearer token (`TIMOTHY_API_TOKEN`). Stored on this device only. Never synced.
- **Default collection.** A specific collection, or auto-classify.

Saving the base URL prompts for host permission to that origin only. Disconnect
removes the saved credentials and hides the Timothy icon.

## Development

```
make install   # npm install in node:24.18.0-alpine
make test
make lint
make build
make dev       # Vite HMR; still load the unpacked extension from dist/ after build
```

No host Node install. Named Docker volumes cache `node_modules` and the npm cache.

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
