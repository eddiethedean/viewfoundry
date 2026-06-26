# @viewfoundry/vite

Vite plugin for ViewFoundry projects — load document JSON via a virtual module with dev-server HMR and validation errors in the Vite overlay.

## Setup

```ts
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

Use the **named export** `{ viewfoundry }`, not a default import.

## Virtual document module

Import the validated document in your app:

```ts
import seedDocument from 'virtual:viewfoundry/document';
```

Add a type shim (`src/vite-env.d.ts`):

```ts
declare module 'virtual:viewfoundry/document' {
  import type { ViewDocument } from '@viewfoundry/core';
  const document: ViewDocument;
  export default document;
}
```

### HMR

When `viewfoundry/document.json` changes on disk, the plugin invalidates the virtual module and sends a `viewfoundry:document-update` event:

```ts
useEffect(() => {
  if (!import.meta.hot) return;
  import.meta.hot.accept('virtual:viewfoundry/document', (mod) => {
    if (mod?.default) setDocument(mod.default);
  });
  import.meta.hot.on('viewfoundry:document-update', async () => {
    const mod = await import('virtual:viewfoundry/document');
    setDocument(mod.default);
  });
}, []);
```

Invalid JSON or document validation errors fail module load with a readable error in the Vite overlay.

## Options

| Option            | Default                     | Description                                    |
| ----------------- | --------------------------- | ---------------------------------------------- |
| `document`        | `viewfoundry/document.json` | Path to `ViewDocument` JSON (relative to root) |
| `codegen`         | —                           | Optional watch mode — regenerate TSX on change |
| `codegen.output`  | —                           | Output TSX path                                |
| `codegen.imports` | —                           | Import map JSON for codegen                    |
| `codegen.tokens`  | —                           | Style tokens JSON for codegen                  |

## Production builds

The plugin resolves `virtual:viewfoundry/document` during `vite build` as well as dev, embedding the current JSON from disk.

Peer dependencies: `vite@^5.0.0 || ^6.0.0`, `@viewfoundry/core@^0.5.0`, `@viewfoundry/codegen@^0.5.0` (codegen optional unless using `codegen` watch).

See [Integrate into an existing app](../integrate-existing-app.md) and [Migration from 0.4 → 0.5](../migration-0.4-0.5.md).
