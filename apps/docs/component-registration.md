# Component registration

```{note}
**Today:** manual `defineComponent` for embed mode. **v0.9:** `@viewfoundry/discover` and `viewfoundry import` will bootstrap registry entries from your codebase. See [Roadmap & direction](roadmap-and-direction.md).
```

ViewFoundry only edits components you explicitly register (or discover).

## Basic registration

```ts
import { defineComponent, text, select } from '@viewfoundry/schema';
import { createRegistry } from '@viewfoundry/core';
import { Button } from './components/Button';

const ButtonDefinition = defineComponent(Button, {
  type: 'Button', // must match node.type in JSON
  label: 'Button', // palette and layers panel
  category: 'Controls', // palette grouping
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
  },
});

export const registry = createRegistry([ButtonDefinition]);
```

## Forward `style` to a DOM element

The Style Editor writes to `node.style`. At render time, the editor and runtime merge that into each component's `style` prop. Your component must accept `style` and apply it to a DOM node:

```tsx
import type { CSSProperties, ReactNode } from 'react';

export function Button({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <button type="button" style={style}>
      {children}
    </button>
  );
}
```

Without `style` forwarding, Style Editor changes will not appear on the canvas. See [Migration 0.3 → 0.4](migration-0.3-0.4.md).

## Grid and Row containers

Empty documents bootstrap a default **Grid**. Register at least one grid container type (`Grid`, `Row`, or your own) with:

- `acceptsChildren: true`
- `allowedChildren` listing types that may be nested (optional but recommended)
- Props for columns, rows, gap (see [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react))

Child placement lives on `node.layout.grid`, not in component props. Your grid component should use CSS Grid on a wrapper `div` and render `{children}`.

## Child constraints

| Option                                | Effect                                                    |
| ------------------------------------- | --------------------------------------------------------- |
| `acceptsChildren: true`               | Node can have child nodes in the document tree            |
| `allowedChildren: ['Button', 'Text']` | Palette insert and move validation restrict child types   |
| Omit `allowedChildren`                | Any registered type may be nested (subject to grid rules) |

## Import map for codegen

Every registered `type` used in documents needs an entry for `generateTsx`:

```ts
export const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Grid: { importPath: './components', exportName: 'Grid' },
};
```

- `importPath` — relative to the generated file, no extension
- `exportName` — named export (use `defaultImport: true` for default exports)

## Style tokens

Pass optional token presets to the editor and codegen:

```ts
export const styleTokens = {
  'color.primary': '#3182ce',
  'spacing.md': 16,
};
```

```tsx
<ViewFoundryEditor
  registry={registry}
  document={document}
  onChange={setDocument}
  styleTokens={styleTokens}
/>
```

Authors can pick tokens in the Style Inspector; codegen resolves them when you pass the same map to `generateTsx`.

## Validate on load

When loading JSON from storage or an API, run `validateDocument(document, registry)` before applying it. Invalid types, props, or grid placement will surface as validation issues instead of silent canvas errors.

## Related

- [Getting started](getting-started.md)
- [Integrate into an existing app](integrate-existing-app.md)
- [Grid layout](grid-layout.md)
- [@viewfoundry/schema](packages/schema.md)
