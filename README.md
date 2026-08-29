# Pounce

Official browser extension for [Timothy](https://github.com/timothy-agent/timothy).
Clip the page you are reading into your Timothy knowledgebase: Pounce extracts the
article from the rendered DOM, converts it to markdown in your browser, and sends it
to your own Timothy instance.

Because extraction happens inside your logged-in browser session, Pounce captures
content that server-side URL ingestion cannot reach: pages behind logins, paywalled
articles you subscribe to, and JavaScript-rendered pages.

> Status: early development, not yet usable.

## How it works

1. Click the Pounce button (or clip a selection via the context menu).
2. Review and edit the extracted markdown, pick a collection.
3. Send. The document lands in your Timothy knowledgebase and is indexed for retrieval.

All requests go to the Timothy base URL you configure. No third-party services, no
analytics, no external requests at runtime.

## Requirements

- A running [Timothy](https://github.com/timothy-agent/timothy) instance
- Chrome (Manifest V3); Firefox support is planned

## Installation

TODO: load-unpacked instructions and packed releases.

## Configuration

TODO: options page (Timothy base URL, API token, defaults).

## Development

TODO: build and test instructions (Docker-based Node toolchain, no host installs).

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting process.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[AGPL-3.0](LICENSE)
