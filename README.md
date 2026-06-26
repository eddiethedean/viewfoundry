# ViewFoundry

[![CI](https://github.com/eddiethedean/viewfoundry/actions/workflows/ci.yml/badge.svg)](https://github.com/eddiethedean/viewfoundry/actions/workflows/ci.yml)
[![Release](https://github.com/eddiethedean/viewfoundry/actions/workflows/release.yml/badge.svg)](https://github.com/eddiethedean/viewfoundry/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/@viewfoundry/core)](https://www.npmjs.com/package/@viewfoundry/core)
[![npm org](https://img.shields.io/badge/npm-@viewfoundry-CB3837?logo=npm)](https://www.npmjs.com/org/viewfoundry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

ViewFoundry is an embeddable visual editor framework for React applications.

Register your real components. ViewFoundry gives you a no-code editor, canvas, property inspector, document model, serialization, history, and code generation.

## Quick start

```bash
pnpm install
pnpm build
pnpm test
pnpm test:e2e   # Playwright UI smoke tests (first run: pnpm exec playwright install chromium)
pnpm dev        # runs examples/basic-react
```

## Packages (0.2.0)

| Package                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `@viewfoundry/core`    | Framework-agnostic document engine           |
| `@viewfoundry/schema`  | Component definition and prop schema helpers |
| `@viewfoundry/react`   | React runtime renderer                       |
| `@viewfoundry/editor`  | Visual editor UI                             |
| `@viewfoundry/codegen` | TSX code generation                          |
| `@viewfoundry/vite`    | Vite plugin stub (no-op until v0.5.0)        |
| `@viewfoundry/cli`     | `viewfoundry export` / `validate` CLI        |

Install all `@viewfoundry/*` packages at the **same version**. See [CHANGELOG.md](CHANGELOG.md) and [specs/PACKAGE_API_SPEC.md](specs/PACKAGE_API_SPEC.md).

### 0.x stability

ViewFoundry is **early-access** during `0.x`. Minor releases may add APIs and optional document fields. Package semver (`0.2.0`) is separate from document schema version (`ViewDocument.version: '0.1'`). `1.0.0` is reserved for a stable public API.

## Usage

```tsx
import { defineComponent, text, select, boolean } from '@viewfoundry/schema';
import { createRegistry } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';

const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
  },
});

const registry = createRegistry([ButtonDefinition]);

<ViewFoundryEditor registry={registry} onChange={(doc) => save(doc)} />;
```

When using `@viewfoundry/editor`, import **both** `@viewfoundry/editor/styles.css` and `@viewfoundry/react/styles.css`. The editor stylesheet covers chrome; the react stylesheet covers canvas selection overlays and missing-component fallbacks.

Runtime-only apps can use `@viewfoundry/react` without the editor:

```tsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';
```

## Example

See `examples/basic-react` for a full demo with Button, Card, Stack, Heading, and Text components, localStorage persistence, and TSX export.

## Documentation

Published docs (Read the Docs): build locally with `pnpm docs:build` and preview with `pnpm docs:preview`. The site includes an [embedded Studio](apps/docs/studio.md) built from `apps/docs-studio`.

Planning specs live in `docs/`. The implementation follows `docs/ROADMAP.md`.

**Planned:** [v0.3.0](docs/ROADMAP.md#v030---grid-layout--dragdrop) grid drag/drop · [v0.4.0](docs/ROADMAP.md#v040---style-editor) Style Editor · [v0.6.0](docs/ROADMAP.md#v060---documentation-site) Read the Docs studio. See `docs/ROADMAP.md` for the full release plan.
