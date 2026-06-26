# Getting started

## Install

Install the packages you need at the **same version**:

```bash
npm install @viewfoundry/core@0.2.0 @viewfoundry/schema@0.2.0 @viewfoundry/react@0.2.0 @viewfoundry/editor@0.2.0
```

Or with pnpm in a monorepo:

```bash
pnpm add @viewfoundry/core @viewfoundry/schema @viewfoundry/react @viewfoundry/editor
```

## Register components

Use `defineComponent` from `@viewfoundry/schema` and `createRegistry` from `@viewfoundry/core`:

```tsx
import { defineComponent, text, select, boolean } from '@viewfoundry/schema';
import { createRegistry } from '@viewfoundry/core';

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
```

## Embed the editor

```tsx
import { ViewFoundryEditor } from '@viewfoundry/editor';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';

function Studio({ document, onChange }) {
  return (
    <ViewFoundryEditor
      registry={registry}
      document={document}
      onChange={onChange}
      onExport={() => {
        /* generate TSX with @viewfoundry/codegen */
      }}
    />
  );
}
```

Import **both** stylesheets when using the full editor. The editor CSS covers chrome; the react CSS covers canvas selection overlays.

## Render without the editor

Use `@viewfoundry/react` for runtime-only rendering:

```tsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';

<ViewFoundryProvider document={document} registry={registry} mode="preview">
  <ViewRenderer />
</ViewFoundryProvider>;
```

## Edit / Live modes

`ViewFoundryEditor` ships with a single-viewport **Edit / Live** toggle. Live mode hides palette, layers, and inspector while keeping the same document and canvas region.

## Next steps

- [Try the Studio](studio.md)
- [Package overview](packages/index.md)
- [Architecture](architecture.md)
