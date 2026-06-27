# Contributing to ViewFoundry

Thank you for considering a contribution. ViewFoundry is an early-access `0.x` project — we welcome fixes, tests, and documentation improvements.

## Prerequisites

- **Node.js 20+**
- **pnpm 9** (see `packageManager` in root `package.json`)
- **Python 3** with pip (for `pnpm docs:build` only)

## Development setup

```bash
git clone https://github.com/eddiethedean/viewfoundry.git
cd viewfoundry
pnpm install
pnpm build
```

## Commands

| Command             | Purpose                                                                               |
| ------------------- | ------------------------------------------------------------------------------------- |
| `pnpm build`        | Build all packages                                                                    |
| `pnpm test`         | Unit tests (Vitest)                                                                   |
| `pnpm test:e2e`     | Playwright UI tests (install browsers first: `pnpm exec playwright install chromium`) |
| `pnpm typecheck`    | TypeScript across packages                                                            |
| `pnpm lint`         | ESLint                                                                                |
| `pnpm format`       | Prettier write                                                                        |
| `pnpm format:check` | Prettier check (CI)                                                                   |
| `pnpm check`        | `build` + `test` + `typecheck`                                                        |
| `pnpm ci`           | Full CI gate locally (`check` + lint + format + docs + e2e)                           |
| `pnpm dev`          | Run `examples/basic-react`                                                            |
| `pnpm docs:build`   | Build Sphinx docs + embedded studio                                                   |
| `pnpm docs:preview` | Serve built docs on port 8080                                                         |

CI runs the full checks workflow including docs build. Run `pnpm ci` before opening a PR, or run `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm docs:build`, and `pnpm test:e2e` when your change touches docs or packages.

## Project layout

```text
packages/          @viewfoundry/* libraries
examples/          Demo apps (basic-react, landing-page, dashboard-builder)
apps/docs/         Published Sphinx/MyST docs (Read the Docs)
apps/docs-studio/  Vite bundle embedded in docs
docs/              Planning specs (roadmap, code-first, DnD research — may lag code)
specs/             Public API contract (PACKAGE_API_SPEC.md)
```

**User-facing docs** live in `apps/docs/` and publish to [Read the Docs](https://viewfoundry.readthedocs.io/). **Product direction:** [docs/CODE_FIRST.md](docs/CODE_FIRST.md), [docs/DND_AND_LAYOUT_RESEARCH.md](docs/DND_AND_LAYOUT_RESEARCH.md), [docs/ROADMAP.md](docs/ROADMAP.md), mirrored on RTD as [Roadmap & direction](https://viewfoundry.readthedocs.io/en/latest/roadmap-and-direction.html).

**API changes** should update `specs/PACKAGE_API_SPEC.md` and relevant `apps/docs/` pages.

## Making changes

1. Fork and create a branch from `main`.
2. Keep PRs focused — one logical change per PR when possible.
3. Add or update tests for behavior changes.
4. Run `pnpm format` if Prettier check fails.
5. Update `CHANGELOG.md` under `[Unreleased]` or the next version section for user-visible changes.

### UX & DX review (user-facing changes)

ViewFoundry serves **studio users** (non-technical authors) and **React developers** (integrators). For any change that touches the editor, embed API, or author workflows, check [docs/UX_AND_DX.md](docs/UX_AND_DX.md) and [docs/DND_AND_LAYOUT_RESEARCH.md](docs/DND_AND_LAYOUT_RESEARCH.md) for Stage DnD requirements:

- **Studio:** plain-language labels, safe defaults, undo where possible, empty/error states without jargon; Stage DnD meets the [global DnD bar](docs/UX_AND_DX.md#global-dnd-quality-bar-v07) when drag behavior changes
- **Developer:** typed public APIs, documented embed and (when shipped) code-first patterns, codegen snippets that compile
- **Tests:** unit tests for core behavior; Playwright e2e when a primary author flow changes (see [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md))

The PR checklist at the bottom of `UX_AND_DX.md` is the release bar for milestones.

## API and versioning

- All `@viewfoundry/*` packages share the same semver.
- Document JSON uses `ViewDocument.version: '0.1'` separately from package version.
- Breaking API changes during `0.x` should be noted in CHANGELOG and migration docs under `apps/docs/`.
- See `specs/PACKAGE_API_SPEC.md` for the public API surface.

## Releases

Maintainers trigger releases via the GitHub Actions release workflow and version tags. See [docs/RELEASE.md](docs/RELEASE.md) for the full checklist. Package versions are synced with `node scripts/sync-versions.mjs` (requires `VERSION=x.y.z`). Do not bump versions in drive-by PRs unless coordinated with maintainers.

## Questions

- [GitHub Discussions / Issues](https://github.com/eddiethedean/viewfoundry/issues)
- [Read the Docs](https://viewfoundry.readthedocs.io/en/latest/)
- [FAQ](https://viewfoundry.readthedocs.io/en/latest/faq.html)
