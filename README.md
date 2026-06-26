# ViewFoundry

[![CI](https://github.com/eddiethedean/viewfoundry/actions/workflows/ci.yml/badge.svg)](https://github.com/eddiethedean/viewfoundry/actions/workflows/ci.yml)
[![Release](https://github.com/eddiethedean/viewfoundry/actions/workflows/release.yml/badge.svg)](https://github.com/eddiethedean/viewfoundry/actions/workflows/release.yml)
[![Documentation Status](https://readthedocs.org/projects/viewfoundry/badge/?version=latest)](https://viewfoundry.readthedocs.io/en/latest/)
[![npm version](https://img.shields.io/npm/v/@viewfoundry/core)](https://www.npmjs.com/package/@viewfoundry/core)
[![npm org](https://img.shields.io/badge/npm-@viewfoundry-CB3837?logo=npm)](https://www.npmjs.com/org/viewfoundry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

ViewFoundry is an embeddable visual editor framework for React applications. **Documentation:** [viewfoundry.readthedocs.io](https://viewfoundry.readthedocs.io/en/latest/)

Register your real components. ViewFoundry gives you a no-code editor, canvas, property inspector, document model, serialization, history, and code generation.

**Fastest start:**

```bash
npx @viewfoundry/cli init my-app && cd my-app && npm install && npm run dev
```

**Try without installing:** [Open the Studio](https://viewfoundry.readthedocs.io/en/latest/studio.html)

## Try it

**Prerequisites:** Node.js 20+, React 18 or 19, a bundler (Vite recommended). Install all `@viewfoundry/*` packages at the same version.

1. **[Open the Studio](https://viewfoundry.readthedocs.io/en/latest/studio.html)** in your browser — Edit/Live toggle, grid layout, JSON and TSX export.
2. **Scaffold with the CLI** (recommended):

```bash
npx @viewfoundry/cli init my-app --template default
cd my-app && npm install && npm run dev
```

3. **Manual embed:** install packages and follow [Getting started](https://viewfoundry.readthedocs.io/en/latest/getting-started.html), or [Integrate into an existing app](https://viewfoundry.readthedocs.io/en/latest/integrate-existing-app.html) for folder layout and Vite setup.

```bash
npm install @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

Runtime-only preview apps may omit `@viewfoundry/editor`, `@viewfoundry/cli`, and `@viewfoundry/vite`.

## Develop the monorepo

Clone and run checks locally:

```bash
git clone https://github.com/eddiethedean/viewfoundry.git
cd viewfoundry
pnpm install
pnpm build
pnpm test
pnpm test:e2e   # first run: pnpm exec playwright install chromium
pnpm dev        # examples/basic-react
pnpm docs:build # Sphinx + embedded studio
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for PR expectations.

## Packages (0.5.0)

See the [package overview](https://viewfoundry.readthedocs.io/en/latest/packages/index.html) for API details.

| Package                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `@viewfoundry/core`    | Framework-agnostic document engine                |
| `@viewfoundry/schema`  | Component definition and prop schema helpers      |
| `@viewfoundry/react`   | React runtime renderer                            |
| `@viewfoundry/editor`  | Visual editor UI                                  |
| `@viewfoundry/codegen` | TSX code generation                               |
| `@viewfoundry/vite`    | Vite plugin — document HMR and validation overlay |
| `@viewfoundry/cli`     | `init`, `validate`, and `export` commands         |

Install all `@viewfoundry/*` packages at the **same version**. See [CHANGELOG.md](CHANGELOG.md) and [specs/PACKAGE_API_SPEC.md](specs/PACKAGE_API_SPEC.md).

### 0.x stability

ViewFoundry is **early-access** during `0.x`. Minor releases may add APIs and optional document fields. Package semver (`0.5.0`) is separate from document schema version (`ViewDocument.version: '0.1'`). `1.0.0` is reserved for a stable public API.

## Usage

For install steps, component registration, codegen, and grid layout, see [Getting started](https://viewfoundry.readthedocs.io/en/latest/getting-started.html). For persistence, CI validation, and runtime-only deploy, see [Production patterns](https://viewfoundry.readthedocs.io/en/latest/production-patterns.html).

When using `@viewfoundry/editor`, import **both** `@viewfoundry/editor/styles.css` and `@viewfoundry/react/styles.css`. The editor stylesheet covers chrome; the react stylesheet covers canvas selection overlays and missing-component fallbacks.

Runtime-only apps can use `@viewfoundry/react` without the editor:

```tsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';
```

## Example

See [Example applications](https://viewfoundry.readthedocs.io/en/latest/examples.html) for all three reference apps (`basic-react`, `landing-page`, `dashboard-builder`) and their `viewfoundry init` templates. Monorepo demo: [`examples/basic-react`](examples/basic-react/README.md). You can also [try the Studio](https://viewfoundry.readthedocs.io/en/latest/studio.html) in the browser without cloning the repo.

## Where to read what

| Source                                                                                 | Audience                                   | Trust level                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| [Read the Docs](https://viewfoundry.readthedocs.io/en/latest/)                         | Adopters — install, embed, grid, FAQ       | **Primary user guides**               |
| [Package API spec](https://viewfoundry.readthedocs.io/en/latest/package-api-spec.html) | Integrators — full public API              | **API contract** (synced from GitHub) |
| [`specs/PACKAGE_API_SPEC.md`](specs/PACKAGE_API_SPEC.md)                               | Source of truth for API spec on GitHub     | **API contract source**               |
| [`docs/UX_AND_DX.md`](docs/UX_AND_DX.md)                                               | Maintainers — studio + developer UX bars   | **Release acceptance**                |
| [`docs/`](docs/)                                                                       | Maintainers — roadmap, editor spec, design | Planning specs (**may lag code**)     |
| [`CHANGELOG.md`](CHANGELOG.md)                                                         | Everyone — release notes                   | Current                               |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                                                   | Contributors                               | Current                               |

## Documentation

**Published docs:** [viewfoundry.readthedocs.io/en/latest](https://viewfoundry.readthedocs.io/en/latest/) — guides, [architecture](https://viewfoundry.readthedocs.io/en/latest/architecture.html), [grid layout](https://viewfoundry.readthedocs.io/en/latest/grid-layout.html), [package reference](https://viewfoundry.readthedocs.io/en/latest/packages/index.html), and an embedded Studio.

Build locally with `pnpm docs:build` and preview with `pnpm docs:preview`. Source lives in [`apps/docs`](apps/docs) and [`apps/docs-studio`](apps/docs-studio).

Planning specs in [`docs/`](docs/) describe intent and roadmap; they may lag implementation. The implementation follows [docs/ROADMAP.md](docs/ROADMAP.md).

**Planned (pre-1.0):** [v0.7–v0.9](docs/ROADMAP.md) Interactions · Routing · [v0.10–v0.15](docs/ROADMAP.md) Slots · Bindings · Repeat · Clipboard · Forms · Responsive · [v1.0.0](docs/ROADMAP.md) Stable API. **Shipped:** [v0.6 Documentation site](docs/ROADMAP.md#v060---documentation-site) · [v0.5 CLI & examples](docs/ROADMAP.md#v050---cli--examples) · [v0.4 Style Editor](docs/ROADMAP.md#v040---style-editor). **Post-1.0:** [v1.1+](docs/POST_1_0.md) nested layouts · adapters · loaders · plugins · [existing project import](docs/ROADMAP.md#v160---existing-project-import).
