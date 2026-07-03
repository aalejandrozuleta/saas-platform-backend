# Contributing

This is a proprietary project maintained by a single owner (see
[LICENSE](LICENSE)). It is **not currently open to external
contributions** — pull requests from outside collaborators will not be
merged.

## Reporting bugs or requesting features

Open an issue using the provided templates. Search existing issues first
to avoid duplicates.

## Workflow (maintainer / future team members)

- Branch off `main`; direct pushes to `main` are blocked by branch rules.
- Open a pull request — CI (build, tests, CodeQL, Trivy, Semgrep,
  SonarCloud) must pass before merging.
- Commit messages follow the convention enforced by commitlint:
  `type(scope): subject` (e.g. `fix(auth): correct token expiry check`).
- Keep `pnpm-lock.yaml` in sync with `package.json` changes — CI installs
  with `--frozen-lockfile` and will fail otherwise.
- Update relevant docs under `docs/` when behavior changes.
