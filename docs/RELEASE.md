# Release checklist

Maintainer runbook for ViewFoundry npm releases. Package versions are synced across all `@viewfoundry/*` packages.

## Before tagging

1. **Changelog** — move `[Unreleased]` entries in [`CHANGELOG.md`](../CHANGELOG.md) to a new `## [x.y.z]` section with date.
2. **Migration docs** — if breaking or notable API changes, add or update pages under [`apps/docs/`](../apps/docs/) (e.g. `migration-*.md`).
3. **API spec** — update [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md) for any public API changes; note planned code-first packages when adding v0.7+ APIs.
4. **Published docs** — update [`apps/docs/`](../apps/docs/) including [roadmap-and-direction.md](../apps/docs/roadmap-and-direction.md) when direction or milestones change.
5. **Planning specs** — sync [`docs/CODE_FIRST.md`](CODE_FIRST.md), [`docs/ROADMAP.md`](ROADMAP.md), [`docs/DND_AND_LAYOUT_RESEARCH.md`](DND_AND_LAYOUT_RESEARCH.md), and behavior specs if changed.
6. **Sync CLI templates** — after example or template source changes:

```bash
pnpm sync:templates
```

7. **Tests** — run full CI locally:

```bash
pnpm ci
```

Or step by step: `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:build`, `pnpm test:e2e`.

8. **Version bump** — from repo root:

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
