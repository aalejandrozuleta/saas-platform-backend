# Security Policy

## Reporting a Vulnerability

This is a proprietary, closed-source project. If you discover a security
vulnerability, please **do not open a public issue**. Report it privately
instead.

**Contact:** jhoitan266@gmail.com

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs, screenshots, or proof-of-concept code

You can expect an initial response within 72 hours. Please give a
reasonable amount of time to address the issue before any public
disclosure.

## Supported Versions

Only the `main` branch is actively maintained and receives security fixes.

## Automated Scanning

This repository runs the following on every pull request and on a
schedule:

- **CodeQL** — static analysis for code-level vulnerabilities
- **Trivy** — container image vulnerability scanning
- **Semgrep** — pattern-based security scanning
- **Dependabot** — dependency and GitHub Actions version/security updates
- **Secret scanning + push protection** — enabled at the GitHub level

Third-party dependency vulnerabilities are tracked via Dependabot alerts
in this repository rather than reported here directly.
