# Release checklist

Maintainer runbook for ViewFoundry npm releases. Package versions are synced across all `@viewfoundry/*` packages.

## Before tagging

1. **Changelog** — move `[Unreleased]` entries in [`CHANGELOG.md`](../CHANGELOG.md) to a new `## [x.y.z]` section with date.
2. **Migration docs** — if breaking or notable API changes, add or update pages under [`apps/docs/`](../apps/docs/) (e.g. `migration-*.md`).
3. **API spec** — update [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md) for any public API changes.
4. **Published docs** — update [`apps/docs/`](../apps/docs/) package pages, getting-started pins, and README version references.
5. **Planning specs** — sync [`docs/COMMANDS_AND_HISTORY.md`](COMMANDS_AND_HISTORY.md), [`docs/CODEGEN_SPEC.md`](CODEGEN_SPEC.md), etc. if behavior changed.
6. **Tests** — run full CI locally:

```bash
pnpm ci
```

Or step by step: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:build`, `pnpm test:e2e`.

7. **Version bump** — from repo root:

```bash
VERSION=x.y.z node scripts/sync-versions.mjs
```

Commit version changes. Do not bump versions in unrelated drive-by PRs.

## Tag and publish

1. Create and push an annotated tag: `vX.Y.Z` (must match package version).
2. GitHub Actions **release** workflow publishes all packages to npm.
3. Verify on npm: `@viewfoundry/core`, `editor`, `react`, `schema`, `codegen`, `cli`, `vite`.
4. **Read the Docs** rebuilds from `main` automatically (check [RTD builds](https://readthedocs.org/projects/viewfoundry/builds/)).
5. Confirm [viewfoundry.readthedocs.io](https://viewfoundry.readthedocs.io/en/latest/) shows updated pins and changelog.

## After release

1. Update README install pins if not already done in the release commit.
2. Open a follow-up PR for `[Unreleased]` placeholder in CHANGELOG if needed.
3. Announce breaking changes with links to migration guides.

## Tag vs `main`

The git tag may point to an earlier commit if fixes landed on `main` after tag. Prefer tagging the commit that passed full CI with the released version numbers.

## Related

- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — contributor workflow
- [`.github/workflows/release.yml`](../.github/workflows/release.yml) — publish automation
- [`docs/README.md`](README.md) — planning doc index
