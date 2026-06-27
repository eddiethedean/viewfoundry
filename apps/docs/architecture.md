# Architecture

ViewFoundry is a layered, embeddable monorepo for visual React editing.

## Principles

1. **Registered components first** — only explicitly registered (or discovered) React components are editable.
2. **Schema-driven editing** — prop controls from metadata and/or TypeScript inference.
3. **Runtime and editor separated** — rendering does not require the full editor UI.
4. **Dual authoring modes** — **embed mode** (JSON `ViewDocument`, shipped) and **code-first** (TSX/CSS source of truth, from v0.7). See [Roadmap & direction](roadmap-and-direction.md).
5. **Command-based mutation** — edits flow through commands (document or file patches) for history and validation.
6. **Structured layout** — Stack (flex) and Grid containers, not absolute X/Y as default ([DnD research](https://github.com/eddiethedean/viewfoundry/blob/main/docs/DND_AND_LAYOUT_RESEARCH.md)).
7. **Dual-audience UX** — studio authors and React integrators; see [UX_AND_DX.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/UX_AND_DX.md).

## Package layers (shipped)

```text
@viewfoundry/schema   →  component metadata helpers
@viewfoundry/core     →  document engine (framework-agnostic)
@viewfoundry/react    →  React runtime renderer
@viewfoundry/editor   →  visual editor UI
@viewfoundry/codegen  →  TSX export (embed mode)
@viewfoundry/vite     →  Vite plugin (document HMR)
@viewfoundry/cli      →  init, validate, export
```

The editor depends on core, schema, and react. React depends only on core. Core has no React dependency.

## Planned packages (v0.7+)

| Package                 | Role                                             |
| ----------------------- | ------------------------------------------------ |
| `@viewfoundry/sync`     | TSX/CSS parse, selection map, AST patches        |
| `@viewfoundry/board`    | `createBoard()`, `.board.tsx` isolation fixtures |
| `@viewfoundry/discover` | Component scan and registry bootstrap (v0.9)     |

## Embed-mode document model (shipped)

Used by [Getting started](getting-started.md), the [Studio](studio.md), and CMS-style hosts:

```ts
type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: { name?: string; description?: string };
};

type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  layout?: { grid?: GridPlacement };
  style?: StyleTokenMap;
};
```

Documents are validated with `validateDocument()` and mutated through `applyCommand()`. See [Grid layout](grid-layout.md).

## Code-first data flow (v0.7+)

```text
Host React project (TSX, CSS)
        ↓
Optional @viewfoundry/discover
        ↓
Registry + boards (.board.tsx)
        ↓
@viewfoundry/sync ↔ @viewfoundry/editor (Stage, Elements, Properties, Styles)
        ↓
Git / host persistence
```

Visual edits patch source files; Vite HMR keeps Stage and external IDE in sync.

## Embed-mode data flow (shipped)

```text
Registered components → Registry → ViewDocument JSON → Renderer / Editor / Codegen
```

## Editor panels (target, code-first)

| Panel            | Role                                       |
| ---------------- | ------------------------------------------ |
| **Stage**        | Canvas, DnD, viewport sizing               |
| **Elements**     | Component tree, multi-select, drag-reorder |
| **Properties**   | Prop controls                              |
| **Styles**       | CSS controllers (v0.8)                     |
| **Add Elements** | Categorized insert (v0.9)                  |
| **Pages**        | Routes when editing full app (v0.10)       |

Embed mode uses Palette, Canvas, Layers, and Inspector names today; behavior converges on the Stage DnD quality bar over time.

## Documentation site

This site is built with Sphinx and MyST. The [embedded Studio](studio.md) is a static Vite bundle (embed-mode demo) copied into `_static/studio/` during `pnpm docs:build`.

## Roadmap

| Version     | Status       | Theme                                    |
| ----------- | ------------ | ---------------------------------------- |
| v0.3–v0.6   | **Released** | Grid, Style Editor, CLI, Vite, docs site |
| v0.7        | Planned      | Code-first, boards, sync, Stage DnD      |
| v0.8        | Planned      | Styles panel, Theme Manager              |
| v0.9        | Planned      | Add Elements, project import             |
| v0.10–v0.13 | Planned      | Pages, interactions, blocks, responsive  |
| v1.0        | Planned      | Stable code-first + frozen embed API     |

Details: [Roadmap & direction](roadmap-and-direction.md) and repository [ROADMAP.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/ROADMAP.md).
