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

Invalid JSON or document validation errors behave differently depending on when they occur:

- **First load** — invalid `document.json` fails the virtual module with a readable error in the Vite overlay.
- **While the dev server is running** — a bad save keeps serving the **last valid document** and emits `viewfoundry:document-error` over HMR so your app can show a non-blocking warning instead of breaking the page.

Optional error handler:

```ts
useEffect(() => {
  if (!import.meta.hot) return;
  import.meta.hot.on('viewfoundry:document-error', (payload) => {
    console.warn('Document save failed:', payload.message);
  });
}, []);
```

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

Full API reference: [Package API spec](../package-api-spec.md#viewfoundryvite).

See [Integrate into an existing app](../integrate-existing-app.md) and [Migration from 0.4 → 0.5](../migration-0.4-0.5.md).
