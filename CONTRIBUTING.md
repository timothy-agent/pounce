# Contributing Guidelines

Thank you for your interest in contributing to Pounce. Whether it's a bug report, a new feature, a correction, or additional documentation, feedback and contributions are welcome.

Please read this document before submitting an issue or pull request.

## Security issue notifications

If you discover a potential security issue, please follow the process in [SECURITY.md](SECURITY.md). Do **not** create a public GitHub issue for security problems.

## Reporting bugs / requesting features

Use the [GitHub issue tracker](https://github.com/timothy-agent/pounce/issues). Before filing, check open and recently closed issues to avoid duplicates. Useful details:

- Reproducible steps, including the URL of the page being clipped when relevant
- The extension version and browser version
- The Timothy release your instance runs
- Any errors from the extension's service worker console or the popup

## Development setup

The toolchain runs in Docker; no host Node installation is required. See the [README](README.md) for build and test instructions.

## Contributing via pull requests

Before sending a pull request:

1. Work against the latest `main`.
2. Check open and recently merged PRs for overlap.
3. For significant changes, open an issue first to discuss the approach, so your time isn't wasted on a direction we can't merge.

When submitting:

1. Fork the repository and create a branch named `<type>/<short-description>` (e.g. `feat/selection-clip`, `fix/token-mask`).
2. Keep the change focused. Unrelated reformatting or refactoring makes review harder.
3. Follow [Conventional Commits](https://www.conventionalcommits.org/): `<type>[scope]: <description>` with a subject ≤ 72 chars, lowercase, no trailing period. The body explains **why**, not what.
4. Add or update tests for any logic you add or change.
5. Make sure the build, lint, and test checks pass locally.
6. Fill in the pull request template and stay involved in the review conversation.

### Project invariants

A few rules are enforced in review and are not up for relaxation:

- The API token never leaves extension storage except as a header on requests to the configured Timothy base URL, and never enters page context.
- All network requests go to the operator-configured Timothy instance only. No third-party requests, no analytics, no runtime CDN loads.
- Content scripts are injected on demand when the operator clips; nothing runs on pages the operator did not act on.
- No bulk capture, crawling, or scheduled scraping features.
- Clipped content is data, never markup or code: it is rendered escaped, with raw HTML disabled.

## Finding contributions to work on

Issues labeled `help wanted` or `good first issue` are the best starting points. Documentation improvements are always welcome.

## Code of Conduct

This project has adopted a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Licensing

Pounce is licensed under [AGPL-3.0](LICENSE). By submitting a pull request, you agree that your contribution is licensed under the same terms.
