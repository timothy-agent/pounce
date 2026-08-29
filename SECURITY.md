# Security Policy

Pounce holds an API token for your Timothy instance in browser extension storage and
reads page content from your authenticated browser session. Vulnerabilities in any of
that are worth reporting.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security problems.

Instead, use one of:

- **GitHub private vulnerability reporting** (preferred): [Report a vulnerability](https://github.com/timothy-agent/pounce/security/advisories/new). This creates a private advisory only maintainers can see.
- **Email**: [sumonmselim@gmail.com](mailto:sumonmselim@gmail.com) with a description, reproduction steps, and impact assessment.

You can expect an acknowledgment within a few days. Please practice coordinated disclosure: give us a reasonable window to ship a fix before any public write-up.

## Supported versions

Pounce is in early development. Only the **latest release** receives security fixes; there are no backports.

## Scope notes

Things we especially want to hear about:

- The Timothy API token leaking into page context, logs, or any request other than to the configured Timothy base URL
- A web page injecting script or markup into the extension's popup, options page, or service worker through clipped content
- The extension making requests to anything other than the operator-configured Timothy instance
- Content script code running on pages the operator did not explicitly clip
