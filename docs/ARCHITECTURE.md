# ViewFoundry Architecture

## Architecture principles

1. **Registered components first**: ViewFoundry edits components that developers explicitly register.
2. **Schema-driven editing**: all prop controls are generated from metadata.
3. **Runtime and editor separated**: rendering a document should not require the full editor UI.
4. **Pure document model**: documents must be serializable JSON.
5. **Command-based mutation**: editing operations should flow through commands to support history, validation, and plugins.
6. **Framework adapter boundary**: core should not depend on React.
7. **Embeddable by default**: apps should be able to use the editor as a component.
8. **Dual-audience UX**: every feature must be approachable in the studio and ergonomic for React integrators — see [UX_AND_DX.md](UX_AND_DX.md).

## Monorepo layout

```txt
viewfoundry/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json

  packages/
    core/
    schema/
    react/
    editor/
    codegen/
    vite/
    cli/

  examples/
    basic-react/
    landing-page/
    dashboard-builder/
    lessonkit-adapter/

  apps/
    docs/           # Read the Docs site (prose + embedded studio UI)
    playground/     # optional standalone studio app; may share code with docs embed

  docs/             # planning and design specs (source for apps/docs content)
```

### `apps/docs` (Read the Docs)

Published documentation hosted on Read the Docs.

Owns:

- Sphinx or MyST-based prose docs (getting started, guides, API reference)
- Read the Docs build config (`.readthedocs.yaml`)
- **embedded Studio UI** — a static build of `ViewFoundryEditor` shipped inside the docs site so readers can try ViewFoundry in the browser
- docs build pipeline that compiles the studio bundle before the RTD HTML build

The studio embed should reuse the same component definitions as `examples/basic-react` (or `apps/playground`) so the docs demo stays in sync with the SDK.

Build flow:

```txt
pnpm build (packages)
  ↓
build studio static bundle (Vite)
  ↓
copy assets into apps/docs/_static/ (or equivalent)
  ↓
Read the Docs HTML build
  ↓
deployed site with prose + live studio page
```

````

## Package responsibilities

### `@viewfoundry/core`

Framework-agnostic engine.

Owns:

- `ViewDocument`
- `ViewNode`
- component registry types
- commands
- history
- selection model
- validation
- clipboard model
- plugin API
- interaction model types and validation (planned **v0.8.0**)
- site/route types and path matching (planned **v0.9.0**)

Must not import React.

### `@viewfoundry/schema`

Helpers for defining editable component metadata.

Owns:

- prop field builders
- component definition helpers
- slot definitions
- prop validation helpers
- default value generation
- component `events` / `actions` metadata for interactions (planned **v0.8.0**)
- `routeRef` field builder for link components (planned **v0.9.0**)

### `@viewfoundry/react`

React rendering/runtime adapter.

Owns:

- provider
- renderer
- component lookup
- editable wrappers
- hooks
- runtime context
- interaction interpreter for Live mode (planned **v0.8.0**)
- site router, `ViewRouter`, navigation hooks (planned **v0.9.0**)

Should be usable without `@viewfoundry/editor`.

### `@viewfoundry/editor`

Visual editing UI.

Owns:

- canvas
- palette
- layers panel
- inspector (prop inspector in Component Editor mode; style inspector in Style Editor mode)
- toolbar with **Edit | Live** toggle (single viewport) and **Component | Style** edit sub-modes
- **grid layout system** with canvas drag/drop for repositioning (**v0.3.0**)
- drag/drop (palette insert + layout moves)
- keyboard shortcuts
- editor shell

Depends on `@viewfoundry/core`, `@viewfoundry/schema`, and `@viewfoundry/react`.

**Editor modes:**

| Mode | Purpose |
|------|---------|
| **Edit** | Studio chrome on; Component or Style sub-mode for mutations |
| **Live** | Same canvas viewport; chrome off; interactive runtime render |
| Component (edit sub-mode) | Structure, nesting, schema-driven props, grid layout drag/drop |
| Style (edit sub-mode) | Visual styling via `node.style` tokens (**v0.4.0**) |

### `@viewfoundry/codegen`

Export layer.

Owns:

- JSON normalization
- JSX generation
- TSX generation
- import formatting
- component import maps

### `@viewfoundry/vite`

Vite integration.

Owns:

- development plugin
- SPA dev-server fallback for client routes (planned **v0.9.0**)
- config loading
- HMR helpers

### `@viewfoundry/cli`

Scaffolding and developer commands.

Owns:

- `viewfoundry init`
- `viewfoundry dev`
- `viewfoundry validate` — document or site JSON
- `viewfoundry export` — single page or multi-route site (v0.9.0)

## Data flow

```txt
Registered Components
        ↓
Component Registry
        ↓
ViewDocument JSON
        ↓
Renderer / Editor / Codegen
````

## Editor mutation flow

```txt
User action
  ↓
Command
  ↓
Validation
  ↓
Document update
  ↓
History entry
  ↓
Subscribers re-render
```

## Initial technical stack

- TypeScript
- React
- Vite
- pnpm workspaces
- tsup or tsdown for package builds
- Vitest
- Testing Library
- dnd-kit for drag/drop
- Zustand or internal store for editor state
- Prettier for codegen formatting
