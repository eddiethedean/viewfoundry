# ViewFoundry Architecture

## Architecture principles

1. **Registered components first**: ViewFoundry edits components that developers explicitly register.
2. **Schema-driven editing**: all prop controls are generated from metadata.
3. **Runtime and editor separated**: rendering a document should not require the full editor UI.
4. **Pure document model**: documents must be serializable JSON.
5. **Command-based mutation**: editing operations should flow through commands to support history, validation, and plugins.
6. **Framework adapter boundary**: core should not depend on React.
7. **Embeddable by default**: apps should be able to use the editor as a component.

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
    docs/
    playground/

  docs/
```

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

Must not import React.

### `@viewfoundry/schema`

Helpers for defining editable component metadata.

Owns:

- prop field builders
- component definition helpers
- slot definitions
- prop validation helpers
- default value generation

### `@viewfoundry/react`

React rendering/runtime adapter.

Owns:

- provider
- renderer
- component lookup
- editable wrappers
- hooks
- runtime context

Should be usable without `@viewfoundry/editor`.

### `@viewfoundry/editor`

Visual editing UI.

Owns:

- canvas
- palette
- layers panel
- inspector
- toolbar
- drag/drop
- keyboard shortcuts
- editor shell

Depends on `@viewfoundry/core`, `@viewfoundry/schema`, and `@viewfoundry/react`.

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
- optional route helpers
- config loading
- HMR helpers

### `@viewfoundry/cli`

Scaffolding and developer commands.

Owns:

- `viewfoundry init`
- `viewfoundry dev`
- `viewfoundry export`
- `viewfoundry validate`

## Data flow

```txt
Registered Components
        ↓
Component Registry
        ↓
ViewDocument JSON
        ↓
Renderer / Editor / Codegen
```

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
