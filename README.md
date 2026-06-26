# ViewFoundry

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

Planning and architecture specs live in `docs/`. The implementation follows `docs/IMPLEMENTATION_ROADMAP.md`.

**Planned:** Phase 4 adds **Edit / Live** toggle in a single viewport. Phase 5 adds grid layout drag/drop. Phase 7 adds Style Editor sub-mode. Phase 9 adds Read the Docs with an embedded studio.
