# @viewfoundry/vite

Vite plugin for ViewFoundry — virtual document module, dev HMR, and optional codegen watch.

## Install

```bash
npm install @viewfoundry/vite@0.5.0
```

Peer dependencies: `vite@^5 || ^6`, `@viewfoundry/core`, `@viewfoundry/codegen` (when using codegen watch).

## Usage

```ts
import { viewfoundry } from '@viewfoundry/vite';

export default defineConfig({
  plugins: [
    react(),
    viewfoundry({
      document: 'viewfoundry/document.json',
      codegen: { output: 'GeneratedView.tsx', imports: 'viewfoundry/imports.json' },
    }),
  ],
});
```

Import `virtual:viewfoundry/document` in application code. See [apps/docs/packages/vite.md](../apps/docs/packages/vite.md).
