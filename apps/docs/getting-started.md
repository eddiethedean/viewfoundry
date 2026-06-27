# Getting started

```{note}
**Product direction:** v0.5/v0.6 use **embed mode** (JSON `ViewDocument`) — this guide reflects what ships today. From **v0.7**, the primary path is **code-first** (edits write to TSX/CSS). See [Roadmap & direction](roadmap-and-direction.md).
```

## Quick start (recommended)

Scaffold a project with the CLI:

```bash
npx @viewfoundry/cli init my-app --template default
cd my-app
npm install
npm run dev
```

Templates: `default` (minimal), `landing-page` (marketing layout), `dashboard-builder` (dashboard grid). See [CLI](packages/cli.md).

Edit `viewfoundry/document.json` while the dev server runs — `@viewfoundry/vite` hot-reloads the canvas.

## Prerequisites

- **Node.js 20+**
- **React 18 or 19** with a bundler (Vite recommended)
- **TypeScript** (examples use TS; JS works with typed imports from packages)

Install all `@viewfoundry/*` packages at the **same version** (currently `0.5.0`).

## Install

```bash
npm install @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

Or with pnpm:

```bash
pnpm add @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

Runtime-only apps (preview without the editor) may omit `@viewfoundry/editor`, `@viewfoundry/cli`, and `@viewfoundry/vite`. See [Production patterns](production-patterns.md).

Package semver (`0.5.0`) is separate from the document schema version (`ViewDocument.version: '0.1'`). See the [FAQ](faq.md).

## Minimal example

A short embed you can paste into a Vite + React app. The empty canvas bootstraps a **Grid**, so register at least `Button` and `Grid`. Import **both** stylesheets when using the full editor.

For persistence, export, style tokens, and the full component set, see [Production patterns](production-patterns.md) and [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).

```jsx
import { useState, type CSSProperties, type ReactNode } from 'react';
import { createDocument, createRegistry } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { defineComponent, text, select, number } from '@viewfoundry/schema';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';

function Button({
  children = 'Click me',
  variant = 'primary',
  style,
}: {
  children?: string;
  variant?: 'primary' | 'secondary';
  style?: CSSProperties;
}) {
  return (
    <button type="button" className={`btn btn-${variant}`} style={style}>
      {children}
    </button>
  );
}

function Grid({
  columns = 4,
  rows = 2,
  gap = 8,
  children,
  style,
}: {
  columns?: number;
  rows?: number;
  gap?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, minmax(48px, auto))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const registry = createRegistry([
  defineComponent(Button, {
    type: 'Button',
    label: 'Button',
    category: 'Controls',
    acceptsChildren: true,
    props: {
      children: text({ label: 'Text', defaultValue: 'Click me' }),
      variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
    },
  }),
  defineComponent(Grid, {
    type: 'Grid',
    label: 'Grid',
    category: 'Layout',
    acceptsChildren: true,
    allowedChildren: ['Button', 'Grid'],
    props: {
      columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
      rows: number({ label: 'Rows', defaultValue: 2, min: 1, max: 12 }),
      gap: number({ label: 'Gap', defaultValue: 8, min: 0, max: 64 }),
    },
  }),
]);

export default function App() {
  const [document, setDocument] = useState<ViewDocument>(createDocument);

  return (
    <ViewFoundryEditor registry={registry} document={document} onChange={setDocument} />
  );
}
```

The editor CSS covers chrome; the react CSS covers canvas selection overlays and missing-component fallbacks.

## Register components

Use `defineComponent` from `@viewfoundry/schema` and `createRegistry` from `@viewfoundry/core`. See [Component registration](component-registration.md) for style forwarding, grid containers, and child constraints.

```typescript
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

The `type` string must match the node `type` in your document JSON. Prop field builders drive the inspector controls.

## Codegen and import maps

`generateTsx` from `@viewfoundry/codegen` turns a `ViewDocument` into a React component file. You must provide an **import map** so codegen knows where each component type is imported from:

```ts
import { generateTsx } from '@viewfoundry/codegen';

const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Card: { importPath: './components', exportName: 'Card' },
};

const { code, warnings } = generateTsx({
  document,
  imports: importMap,
  componentName: 'MyView',
  styleTokens,
});
```

- `importPath` — module path relative to the generated file (no file extension).
- `exportName` — named export to import from that module.
- `styleTokens` — optional token map for resolving token references in `node.style`.
- `warnings` — unsupported prop values, missing import map entries, or invalid identifiers.

In v0.3.0+, nodes with `layout.grid` placement are wrapped in a `<div style={{ gridColumn, gridRow }}>` in generated TSX so components without a `style` prop still render correctly.

Wire `onExport` on `ViewFoundryEditor` to call `generateTsx` and show or download the result. See [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react) for a fuller demo with Grid, Row, Card, Stack, and persistence.

## Render without the editor

Use `@viewfoundry/react` for runtime-only rendering:

```jsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';

function Preview({ document, registry }) {
  return (
    <ViewFoundryProvider document={document} registry={registry} mode="preview">
      <ViewRenderer />
    </ViewFoundryProvider>
  );
}
```

## Edit / Live modes

`ViewFoundryEditor` ships with a single-viewport **Edit / Live** toggle. Live mode hides palette, layers, and inspector while keeping the same document and canvas region. Components remain interactive in Live mode.

## Grid layout (v0.3.0)

Empty canvases bootstrap a default grid. Drag components from the palette onto cells, or reposition nodes on the grid. See the [Grid layout guide](grid-layout.md).

## Style Editor (v0.4.0)

In Edit mode, use the **Component | Style** toolbar switcher. Style mode edits `node.style` (spacing, colors, typography, etc.) separately from schema-backed component props. Optional token presets:

```tsx
<ViewFoundryEditor
  registry={registry}
  document={document}
  onChange={setDocument}
  styleTokens={{
    'color.primary': '#3182ce',
    'spacing.md': 16,
  }}
/>
```

See [Migration from 0.3 → 0.4](migration-0.3-0.4.md).

## Next steps

- [Production patterns](production-patterns.md) — persistence, runtime-only deploy, CI validate
- [Integrate into an existing app](integrate-existing-app.md) — folder layout, Vite setup, controlled embed
- [Example applications](examples.md) — all three reference apps and init templates
- [Try the Studio](studio.md) — interactive editor in your browser
- [Grid layout guide](grid-layout.md)
- [Editor keyboard shortcuts](editor-shortcuts.md)
- [Package overview](packages/index.md)
- [Architecture](architecture.md)
- [Migration from 0.2 → 0.3](migration-0.2-0.3.md) if upgrading from 0.2
- [Migration from 0.3 → 0.4](migration-0.3-0.4.md) for Style Editor
- [FAQ](faq.md) and [Troubleshooting](troubleshooting.md)
