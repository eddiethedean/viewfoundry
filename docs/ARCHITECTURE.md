# ViewFoundry Architecture

## Architecture principles

1. **Registered components first**: ViewFoundry edits components that developers explicitly register or that are discovered from the host project.
2. **Schema-driven editing**: prop controls are generated from metadata and/or TypeScript inference.
3. **Runtime and editor separated**: rendering should not require the full editor UI.
4. **Code-first source of truth** (v0.7+): visual edits write to TSX and CSS files; Git-friendly diffs. **Embed mode** (v0.1–v0.6): serializable `ViewDocument` JSON for CMS-style hosts — see [CODE_FIRST.md](CODE_FIRST.md).
5. **Command-based mutation**: editing operations flow through commands (file patches or document updates) to support history, validation, and plugins.
6. **Framework adapter boundary**: sync/core parsing should not hard-code React in ways that block adapters.
7. **Embeddable by default**: apps embed the editor as a React component — unlike desktop-only visual IDEs.
8. **Dual-audience UX**: every feature must be approachable in the studio and ergonomic for React integrators — see [UX_AND_DX.md](UX_AND_DX.md). Editor UX follows Codux panel patterns and Figma/Wix Stage DnD conventions — see [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

## Monorepo layout

```txt
viewfoundry/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json

  packages/
    core/
    schema/
    react/
    editor/
    codegen/
    vite/
    cli/
    board/          # planned v0.7 — createBoard, fixtures
    sync/           # planned v0.7 — AST patch, selection map
    discover/       # planned v0.9 — component scan

  examples/
    basic-react/
    landing-page/
    dashboard-builder/

  apps/
    docs/           # Read the Docs site (prose + embedded studio UI)
    docs-studio/    # Vite bundle embedded in docs

  docs/             # Planning and design specs (not published to RTD — see docs/README.md)
  specs/            # Public API contract (PACKAGE_API_SPEC.md)
```

### `apps/docs` (Read the Docs)

Published documentation hosted on Read the Docs.

Owns:

- Sphinx or MyST-based prose docs (getting started, guides, API reference)
- Read the Docs build config (`.readthedocs.yaml`)
- **embedded Studio UI** — a static build of `ViewFoundryEditor` shipped inside the docs site so readers can try ViewFoundry in the browser
- docs build pipeline that compiles the studio bundle before the RTD HTML build

The studio embed should reuse the same component definitions as `examples/basic-react` (via `apps/docs-studio`) so the docs demo stays in sync with the SDK.

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

- `ViewDocument` / `ViewNode` (**embed mode**, frozen)
- component registry types
- commands (document and, from v0.7, file-edit command types)
- history
- selection model
- validation
- clipboard model
- plugin API

Must not import React.

### `@viewfoundry/sync` (planned **v0.7.0**)

Source editing layer.

Owns:

- TSX/JSX/CSS parse and patch
- DOM selection ↔ source location mapping
- file-level undo snapshots
- safe import insertion on structural edits

See [CODE_FIRST.md](CODE_FIRST.md).

### `@viewfoundry/board` (planned **v0.7.0**)

Component isolation fixtures.

Owns:

- `createBoard()` API
- `.board.tsx` conventions
- board render helpers for tests

### `@viewfoundry/discover` (planned **v0.9.0**)

Project integration.

Owns:

- component scan (globs, exports)
- registry stub generation
- import map bootstrap

### `@viewfoundry/schema`

Helpers for defining editable component metadata.

Owns:

- prop field builders
- component definition helpers
- slot definitions
- prop validation helpers
- default value generation
- component `events` metadata for interactions (planned **v0.11.0** code-first)
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
- interaction handlers in source / optional embed interpreter (planned **v0.11.0**)
- site router, `ViewRouter`, navigation hooks (planned **v0.9.0**)

Should be usable without `@viewfoundry/editor`.

### `@viewfoundry/editor`

Visual editing UI.

Owns:

- **Stage** (canvas) with viewport controls
- **Add Elements panel** (planned **v0.9.0**) — categorized insert
- **Elements panel** — DOM/component tree (evolves from Layers)
- **Properties panel** — schema + TS-inferred prop controls
- **Styles panel** (planned **v0.8.0**) — visual CSS on real stylesheets
- **Theme Manager** (planned **v0.8.0**) — global CSS variables
- toolbar with **Edit | Live** toggle and **Component | Style | Interactions** sub-modes
- board / app page tabs (planned **v0.7.0** / **v0.10.0**)
- grid layout drag/drop (embed mode; code-first uses JSX + CSS layout)
- keyboard shortcuts
- editor shell

Depends on `@viewfoundry/core`, `@viewfoundry/schema`, `@viewfoundry/react`, and from v0.7 `@viewfoundry/sync`, `@viewfoundry/board`.

**Editor modes:**

| Mode | Purpose |
|------|---------|
| **Edit** | Studio chrome on; Component, Style, or Interactions sub-mode |
| **Live** | Same Stage viewport; chrome off; interactive runtime |
| Component (edit sub-mode) | Structure, nesting, props, Add Elements insert |
| Style (edit sub-mode) | CSS classes, variables, computed styles (**v0.8.0** code-first) |
| Interactions (edit sub-mode) | Handler wiring in TSX (**v0.11.0**) |

**Embed mode (v0.1–v0.6):** JSON `ViewDocument`, Style sub-mode on `node.style`, grid on `layout.grid` — unchanged until v1.0 embed API freeze.

### `@viewfoundry/codegen`

Export layer for **embed mode**.

Owns:

- JSON normalization
- JSX generation
- TSX generation
- import formatting
- component import maps

Not required when authoring code-first (source is already TSX).

### `@viewfoundry/vite`

Vite integration.

Owns:

- development plugin
- embed: `virtual:viewfoundry/document` HMR
- code-first: sync HMR, project root, board entry detection (**v0.7.0**)
- SPA dev-server fallback for client routes (**v0.10.0**)

### `@viewfoundry/cli`

Scaffolding and developer commands.

Owns:

- `viewfoundry init`
- `viewfoundry validate` — embed document JSON
- `viewfoundry export` — embed TSX codegen
- `viewfoundry import` — open existing React project (**v0.9.0**)

## Data flow

### Code-first (v0.7+, primary)

```txt
Host React project (TSX, CSS)
        ↓
@viewfoundry/discover (optional)
        ↓
Component Registry + boards
        ↓
@viewfoundry/sync ←→ @viewfoundry/editor (Stage, panels)
        ↓
Git / host file storage
```

### Embed mode (v0.1–v0.6, CMS / browser Studio)

```txt
Registered Components
        ↓
Component Registry
        ↓
ViewDocument JSON
        ↓
ViewRenderer / Editor / generateTsx
```

## Editor mutation flow

### Code-first

```txt
User action (Stage / panel)
  ↓
File-edit command
  ↓
Validation (AST + registry)
  ↓
Patch TSX / CSS files
  ↓
File-level history entry
  ↓
Vite HMR → Stage re-render
```

### Embed mode

```txt
User action
  ↓
Document command
  ↓
Validation
  ↓
ViewDocument update
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
````
