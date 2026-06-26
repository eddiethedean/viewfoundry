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
pnpm dev   # runs examples/basic-react
```

## Packages (0.1.0)

| Package | Description |
|---------|-------------|
| `@viewfoundry/core` | Framework-agnostic document engine |
| `@viewfoundry/schema` | Component definition and prop schema helpers |
| `@viewfoundry/react` | React runtime renderer |
| `@viewfoundry/editor` | Visual editor UI |
| `@viewfoundry/codegen` | TSX code generation |
| `@viewfoundry/vite` | Vite plugin stub |
| `@viewfoundry/cli` | `viewfoundry export` / `validate` CLI |

## Usage

```tsx
import { defineComponent, text, select, boolean } from '@viewfoundry/schema';
import { createRegistry } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/editor/styles.css';

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

<ViewFoundryEditor registry={registry} onChange={(doc) => save(doc)} />
```

## Example

See `examples/basic-react` for a full demo with Button, Card, Stack, Heading, and Text components, localStorage persistence, and TSX export.

## Docs

Planning and architecture specs live in `docs/`. The implementation follows `docs/ROADMAP.md`.

**Planned:** [v0.2.0](docs/ROADMAP.md#v020---edit--live-studio) Edit / Live single viewport · [v0.3.0](docs/ROADMAP.md#v030---grid-layout--dragdrop) grid drag/drop · [v0.4.0](docs/ROADMAP.md#v040---style-editor) Style Editor · [v0.6.0](docs/ROADMAP.md#v060---documentation-site) Read the Docs studio. See `docs/ROADMAP.md` for the full release plan.
