# Architecture

ViewFoundry is a layered monorepo designed for embeddable visual editing.

## Principles

1. **Registered components first** — only explicitly registered React components are editable.
2. **Schema-driven editing** — prop controls are generated from metadata.
3. **Runtime and editor separated** — rendering a document does not require the editor UI.
4. **Pure document model** — documents are JSON-serializable trees.
5. **Command-based mutation** — edits flow through commands for history and validation.

## Package layers

```text
@viewfoundry/schema   →  component metadata helpers
@viewfoundry/core     →  document engine (framework-agnostic)
@viewfoundry/react    →  React runtime renderer
@viewfoundry/editor   →  visual editor UI
@viewfoundry/codegen  →  TSX export
```

The editor depends on core, schema, and react. React depends only on core. Core has no React dependency.

## Document model

```ts
type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: { name?: string; description?: string };
};

type GridPlacement = {
  column?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
};

type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  layout?: { grid?: GridPlacement };
};
```

Documents are validated with `validateDocument()` and mutated through `applyCommand()` for registry-aware inserts and updates. Grid placement is validated for bounds and overlaps within layout containers.

See the [Grid layout guide](grid-layout.md) for editor and codegen behavior.

## Data flow

```text
Registered components → Registry → ViewDocument JSON → Renderer / Editor / Codegen
```

## Documentation site

This site is built with Sphinx and MyST. The [embedded Studio](studio.md) is a static Vite bundle copied into `_static/studio/` during `pnpm docs:build`, so it loads from the same Read the Docs deployment without a separate server.

## Roadmap

| Version | Status       | Theme                                          |
| ------- | ------------ | ---------------------------------------------- |
| v0.3.0  | **Released** | Grid layout and canvas drag-and-drop           |
| v0.4.0  | Planned      | Style Editor sub-mode                          |
| v0.5.0  | Planned      | `viewfoundry init`, Vite plugin, more examples |
| v0.6.0  | **Released** | Read the Docs site with embedded Studio        |
| v0.7.0  | Planned      | LessonKit integration                          |

See the repository [`docs/ROADMAP.md`](https://github.com/eddiethedean/viewfoundry/blob/main/docs/ROADMAP.md) for full release notes.
