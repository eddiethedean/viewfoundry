# Production patterns

Guidance for shipping ViewFoundry beyond local development. **Today:** embed-mode JSON persistence and runtime/editor split. **From v0.7:** code-first hosts persist TSX/CSS via Git — see [Roadmap & direction](roadmap-and-direction.md).

## Editor vs runtime packages

| Need                                   | Packages                                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full visual editor in admin/builder UI | `@viewfoundry/core`, `@viewfoundry/schema`, `@viewfoundry/react`, `@viewfoundry/editor`, `@viewfoundry/codegen` (+ `@viewfoundry/vite` for file HMR in dev) |
| End-user app / production preview only | `@viewfoundry/core`, `@viewfoundry/react` (and `@viewfoundry/schema` if you validate server-side)                                                           |

Runtime-only rendering does **not** require `@viewfoundry/editor` or its CSS:

```jsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';

<ViewFoundryProvider document={document} registry={registry} mode="preview">
  <ViewRenderer />
</ViewFoundryProvider>;
```

Lazy-load the editor in admin routes so production bundles stay smaller:

```tsx
import { lazy, Suspense } from 'react';

const ViewFoundryEditor = lazy(() =>
  import('@viewfoundry/editor').then((m) => ({ default: m.ViewFoundryEditor })),
);

function BuilderPage(props) {
  return (
    <Suspense fallback={null}>
      <ViewFoundryEditor {...props} />
    </Suspense>
  );
}
```

Import `@viewfoundry/editor/styles.css` and `@viewfoundry/react/styles.css` only on routes that mount the editor.

## Persistence

Common patterns:

1. **File + HMR (dev)** — `viewfoundry/document.json` via `@viewfoundry/vite`; optional `localStorage` overlay as in [examples/basic-react](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).
2. **API-backed (prod)** — load JSON from your backend; pass `document` + `onChange` to `ViewFoundryEditor`; persist snapshots on `onChange`.
3. **Controlled sync** — external tree updates use `syncDocument` semantics (see [Troubleshooting — undo](troubleshooting.md#undo-and-redo-with-controlled-document)). Invalid inbound documents are rejected and surface `lastError` in the store.

Always validate before trusting stored JSON:

```ts
import { validateDocument } from '@viewfoundry/core';

const result = validateDocument(parsed, registry, { allowMissingComponents: false });
if (!result.valid) {
  // handle result.issues — see package-api-spec validation codes
}
```

## CI validation

Validate saved documents in CI without the editor:

```bash
npx @viewfoundry/cli validate ./viewfoundry/document.json
```

Strict export check (missing imports / unresolved tokens fail the job):

```bash
npx @viewfoundry/cli export ./viewfoundry/document.json ./GeneratedView.tsx \
  --imports ./viewfoundry/imports.json \
  --tokens ./viewfoundry/tokens.json \
  --strict
```

In-app export with your import map remains the recommended path for production TSX (see [Getting started — Codegen](getting-started.md#codegen-and-import-maps)).

## Codegen in production builds

- **Dev:** optional `@viewfoundry/vite` `codegen` watch writes `GeneratedView.tsx` when the document changes.
- **Release:** run `generateTsx` in a build script or export step with the same import map your app uses.
- **Ship JSON:** many teams persist `ViewDocument` JSON and render with `@viewfoundry/react` at runtime instead of checking in generated TSX.

## Bundler support

| Bundler                        | Status                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Vite 5/6                       | Supported — `@viewfoundry/vite` plugin, all examples                                                    |
| Other (Webpack, Next.js, etc.) | Use packages directly; no official plugin yet — embed ESM packages and manage document loading yourself |

## Security

See [Security](security.md) for JSON trust boundaries, path containment, and codegen sanitization.

## Related

- [Integrate into an existing app](integrate-existing-app.md)
- [Example applications](examples.md)
- [CLI package guide](packages/cli.md)
- [Architecture](architecture.md)
