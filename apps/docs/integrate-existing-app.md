# Integrate into an existing Vite + React app

This guide walks through adding ViewFoundry to a project that already uses Vite and React. The reference implementation is [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).

## Prerequisites

- Node.js 20+, React 18 or 19, Vite 5 or 6
- All `@viewfoundry/*` packages at the same version (currently `0.5.0`)

## 1. Install packages

```bash
npm install @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

Runtime-only preview apps may omit `@viewfoundry/editor`, `@viewfoundry/cli`, and `@viewfoundry/vite` — see [Production patterns](production-patterns.md).

## 2. Recommended folder layout

```text
src/
  App.tsx              # Editor shell, persistence, export UI
  definitions.ts       # createRegistry, defineComponent, importMap, styleTokens
  components/
    index.tsx          # React components rendered on the canvas
    Button.tsx         # (optional split files)
```

Keep **definitions** separate from **components**:

- `components/` — real React components your app (and generated TSX) import.
- `definitions.ts` — schema metadata, registry, import map for codegen.

The `type` string in each `defineComponent` call must match the `type` field on document nodes.

## 3. Register components

Every editable component needs:

1. A React component that accepts and forwards `style?: CSSProperties` (required for Style Editor).
2. A `defineComponent` entry with prop field builders.
3. An import map entry for codegen.

```tsx
// src/components/Button.tsx
import type { CSSProperties, ReactNode } from 'react';

export function Button({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <button type="button" style={style}>
      {children}
    </button>
  );
}
```

```ts
// src/definitions.ts
import { createRegistry } from '@viewfoundry/core';
import { defineComponent, text } from '@viewfoundry/schema';
import { Button } from './components/Button.js';

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
  },
});

export const demoRegistry = createRegistry([ButtonDefinition]);

export const importMap = {
  Button: { importPath: './components/Button', exportName: 'Button' },
};
```

Register a **Grid** (or Row) container — empty canvases bootstrap a default grid. See [Component registration](component-registration.md) and [Grid layout](grid-layout.md).

## 4. Embed the editor

```tsx
// src/App.tsx
import { useState } from 'react';
import { createDocument, validateDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry, styleTokens } from './definitions.js';

export default function App() {
  const [document, setDocument] = useState<ViewDocument>(() => createDocument());

  return (
    <ViewFoundryEditor
      registry={demoRegistry}
      document={document}
      onChange={setDocument}
      styleTokens={styleTokens}
    />
  );
}
```

Import **both** stylesheets. Missing `@viewfoundry/react/styles.css` breaks selection overlays.

## 5. Vite configuration

ViewFoundry packages are standard ESM npm modules. For file-based documents and dev HMR, add `@viewfoundry/vite`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viewfoundry } from '@viewfoundry/vite';

export default defineConfig({
  plugins: [
    react(),
    viewfoundry({
      document: 'viewfoundry/document.json',
      codegen: {
        output: 'GeneratedView.tsx',
        imports: 'viewfoundry/imports.json',
        tokens: 'viewfoundry/tokens.json',
      },
    }),
  ],
});
```

In your editor shell:

```ts
import seedDocument from 'virtual:viewfoundry/document';

// use seedDocument as initial state; optional localStorage on top
// handle import.meta.hot for viewfoundry:document-update (see packages/vite.md)
```

See [@viewfoundry/vite](packages/vite.md) and [Migration from 0.4 → 0.5](migration-0.4-0.5.md).

## 6. Controlled vs uncontrolled document

**Controlled (recommended):** pass `document` and `onChange`. Undo/redo is preserved via `syncDocument` when updates flow through `onChange`. Redo clears when you load an external document (e.g. from an API).

**Uncontrolled:** omit `document`; use `onChange` only to persist snapshots.

See [Troubleshooting — controlled undo](troubleshooting.md#undo-and-redo-with-controlled-document).

## 7. Validate and persist

Validate before trusting stored JSON:

```ts
import { validateDocument } from '@viewfoundry/core';

const validation = validateDocument(parsed, demoRegistry, { allowMissingComponents: false });
if (validation.valid) setDocument(parsed);
```

Persist on change with `localStorage`, your API, or a database. The document is plain JSON — no functions or React elements.

## 8. Export TSX

In-app export (typical for admin panels):

```ts
import { generateTsx } from '@viewfoundry/codegen';

const { code, warnings } = generateTsx({
  document,
  imports: importMap,
  componentName: 'PageView',
  styleTokens,
});
```

CLI export (CI or scripts):

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
```

The CLI uses an empty import map — add imports in application code or post-process for production paths.

## 9. Production build

ViewFoundry runs client-side only. Mark the editor route as client-only if you use a meta-framework (Next.js App Router, etc.). Do not render `ViewFoundryEditor` on the server.

Run `vite build` as usual. No extra build steps unless you wire codegen into your pipeline.

## 10. Compare with the demo

| Concern            | Your app            | `examples/basic-react`                        |
| ------------------ | ------------------- | --------------------------------------------- |
| Registry           | `definitions.ts`    | `src/definitions.ts`                          |
| Components         | `src/components/`   | `src/components/index.tsx`                    |
| Persistence        | your choice         | `localStorage` + `validateDocument`           |
| Export             | `onExport` + drawer | same pattern                                  |
| Full component set | add as needed       | Button, Card, Stack, Grid, Row, Heading, Text |

Clone the monorepo and run `pnpm dev` to explore the demo locally.

## Next steps

- [Component registration](component-registration.md)
- [Getting started](getting-started.md) — minimal paste-in example
- [Editor keyboard shortcuts](editor-shortcuts.md)
- [Package API reference](packages/index.md)
