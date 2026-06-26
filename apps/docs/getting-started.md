# Getting started

## Prerequisites

- **Node.js 20+**
- **React 18 or 19** with a bundler (Vite recommended)
- **TypeScript** (examples use TS; JS works with typed imports from packages)

Install all `@viewfoundry/*` packages at the **same version** (currently `0.4.0`).

## Install

```bash
npm install @viewfoundry/core@0.4.0 @viewfoundry/schema@0.4.0 @viewfoundry/react@0.4.0 @viewfoundry/editor@0.4.0 @viewfoundry/codegen@0.4.0
```

Or with pnpm:

```bash
pnpm add @viewfoundry/core@0.4.0 @viewfoundry/schema@0.4.0 @viewfoundry/react@0.4.0 @viewfoundry/editor@0.4.0 @viewfoundry/codegen@0.4.0
```

Package semver (`0.4.0`) is separate from the document schema version (`ViewDocument.version: '0.1'`). See the [FAQ](faq.md).

## Minimal example

This is a minimal embed you can paste into a Vite + React app. It registers `Button` and `Grid` (required for the default empty canvas), forwards `style` for the Style Editor, validates loaded JSON, persists to `localStorage`, and exports TSX on demand.

For the full component set (Card, Stack, Row, Heading, Text), see [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react) or [Integrate into an existing app](integrate-existing-app.md).

```jsx
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createDocument, createRegistry, validateDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { defineComponent, text, select, boolean, number } from '@viewfoundry/schema';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { generateTsx } from '@viewfoundry/codegen';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';

function Button({
  children = 'Click me',
  variant = 'primary',
  disabled = false,
  style,
}: {
  children?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button type="button" className={`btn btn-${variant}`} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

function Grid({
  columns = 4,
  rows = 2,
  gap = 8,
  minRowHeight = 48,
  children,
  style,
}: {
  columns?: number;
  rows?: number;
  gap?: number;
  minRowHeight?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, minmax(${minRowHeight}px, auto))`,
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
  },
});

const GridDefinition = defineComponent(Grid, {
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: ['Button', 'Grid'],
  props: {
    columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
    rows: number({ label: 'Rows', defaultValue: 2, min: 1, max: 12 }),
    gap: number({ label: 'Gap', defaultValue: 8, min: 0, max: 64 }),
    minRowHeight: number({ label: 'Min row height', defaultValue: 48, min: 0, max: 200 }),
  },
});

const registry = createRegistry([ButtonDefinition, GridDefinition]);

const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Grid: { importPath: './components', exportName: 'Grid' },
};

const styleTokens = {
  'color.primary': '#3182ce',
  'spacing.md': 16,
};

const STORAGE_KEY = 'my-viewfoundry-document';

function loadDocument(): ViewDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ViewDocument;
      const validation = validateDocument(parsed, registry, { allowMissingComponents: false });
      if (validation.valid) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  return createDocument();
}

export default function App() {
  const [document, setDocument] = useState<ViewDocument>(loadDocument);
  const [exportedCode, setExportedCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document]);

  const handleExport = useCallback(() => {
    const { code, warnings } = generateTsx({
      document,
      imports: importMap,
      componentName: 'MyView',
      styleTokens,
    });
    setExportedCode(
      warnings.length > 0
        ? `${code}\n// Warnings:\n${warnings.map((w) => `// ${w}`).join('\n')}`
        : code,
    );
  }, [document]);

  return (
    <div>
      <ViewFoundryEditor
        registry={registry}
        document={document}
        onChange={setDocument}
        onExport={handleExport}
        styleTokens={styleTokens}
      />
      {exportedCode !== null && <pre aria-label="Generated TSX">{exportedCode}</pre>}
    </div>
  );
}
```

Import **both** stylesheets when using the full editor. The editor CSS covers chrome; the react CSS covers canvas selection overlays and missing-component fallbacks.

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

- [Integrate into an existing app](integrate-existing-app.md) — folder layout, Vite setup, controlled embed
- [Try the Studio](studio.md) — interactive editor in your browser
- [Grid layout guide](grid-layout.md)
- [Editor keyboard shortcuts](editor-shortcuts.md)
- [Package overview](packages/index.md)
- [Architecture](architecture.md)
- [Migration from 0.2 → 0.3](migration-0.2-0.3.md) if upgrading from 0.2
- [Migration from 0.3 → 0.4](migration-0.3-0.4.md) for Style Editor
- [FAQ](faq.md) and [Troubleshooting](troubleshooting.md)
