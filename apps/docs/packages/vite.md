# @viewfoundry/vite

Vite plugin stub for ViewFoundry projects.

## Status

The plugin is a **no-op placeholder** until v0.5.0. It exports a valid Vite plugin interface so early adopters can wire it in without breaking builds:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viewfoundry from '@viewfoundry/vite';

export default defineConfig({
  plugins: [react(), viewfoundry()],
});
```

## Planned (v0.5.0)

- Dev-server integration for hot document reload
- Optional codegen watch mode
- Scaffold helpers alongside `viewfoundry init`

For now, use Vite normally and import `@viewfoundry/*` packages directly. See [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).

Peer dependency: `@viewfoundry/core@^0.3.0`.
