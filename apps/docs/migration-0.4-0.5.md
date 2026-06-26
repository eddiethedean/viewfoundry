# Migration from 0.4 → 0.5

ViewFoundry **0.5.0** adds project scaffolding (`viewfoundry init`), a real `@viewfoundry/vite` plugin, and new examples. There are **no document schema changes** — `ViewDocument.version` stays `'0.1'`.

## Upgrade packages

Install all `@viewfoundry/*` packages at **0.5.0** together:

```bash
npm install @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

## New projects

Use the CLI instead of copying `examples/basic-react` manually:

```bash
npx @viewfoundry/cli init my-app --template default
cd my-app && npm install && npm run dev
```

Templates: `default`, `landing-page`, `dashboard-builder`.

## Existing Vite apps

1. Add `@viewfoundry/vite` and wire the plugin in `vite.config.ts` (see [Vite package guide](packages/vite.md)).
2. Move your seed document to `viewfoundry/document.json`.
3. Import `virtual:viewfoundry/document` in your editor shell and handle HMR (see [Integrate into an existing app](integrate-existing-app.md)).

Optional: keep `localStorage` persistence on top of the file seed — `examples/basic-react` shows both.

## What changed

| Area                | 0.4.x                   | 0.5.0                                      |
| ------------------- | ----------------------- | ------------------------------------------ |
| `viewfoundry init`  | Stub (printed guidance) | Scaffolds runnable Vite + React projects   |
| `@viewfoundry/vite` | No-op plugin            | Virtual document module + HMR + validation |
| Examples            | `basic-react` only      | + `landing-page`, `dashboard-builder`      |

## Breaking changes

None for document JSON or public editor/runtime APIs. Peer dependency ranges bump to `^0.5.0` — upgrade all packages together.

[Full changelog on GitHub →](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md)
