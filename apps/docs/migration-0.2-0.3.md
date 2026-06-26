# Migration: 0.2 → 0.3

This guide covers upgrading from ViewFoundry **0.2.x** to **0.3.0**.

## Upgrade packages

Bump all `@viewfoundry/*` packages together:

```bash
npm install @viewfoundry/core@0.3.0 @viewfoundry/schema@0.3.0 @viewfoundry/react@0.3.0 @viewfoundry/editor@0.3.0 @viewfoundry/codegen@0.3.0
```

## Document schema

`ViewDocument.version` remains `'0.1'`. No mandatory migration script is required.

**New optional field:** `layout?: NodeLayout` on `ViewNode`:

```ts
layout?: {
  grid?: {
    column?: number;
    row?: number;
    colSpan?: number;
    rowSpan?: number;
  };
};
```

Documents saved in 0.2.x without `layout` continue to load. Nodes without `layout.grid` behave as before (stacked in DOM order inside flex/stack containers).

## Editor behavior changes

### Grid bootstrap

When the canvas root has no layout children, the editor **automatically inserts a default `Grid` container** on first edit. Register a `Grid` (and optionally `Row`) component in your registry if you use the stock editor — see [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).

### Drag-and-drop

Palette and canvas DnD now use **dnd-kit** instead of native HTML5 drag-and-drop. Custom editor integrations that relied on native `draggable` events need to migrate to the editor store APIs (`moveNodeToCell`, etc.) or the composition exports.

### New store APIs

- `moveNodeToCell` — reposition a node to a grid cell
- `nudgeNodeLayout` — keyboard/programmatic cell nudge

## New commands

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `setNodeLayout` | Set `layout.grid` on a node              |
| `moveNode`      | Now accepts optional `layout` in payload |
| `insertNode`    | Now accepts optional `layout` in payload |

## Validation

`validateDocument()` now checks grid bounds and overlapping placements inside grid containers. Documents that were loose in 0.2 may surface validation issues once nodes have `layout.grid` set.

## Codegen

`generateTsx` emits `gridColumn` and `gridRow` inline styles for nodes with `layout.grid`. No import map changes are required for layout itself.

## React provider

`ViewFoundryProvider` accepts optional `wrapEditNode` and `renderGridDropLayer` for custom editor shells. Existing preview-only usage is unchanged.

## CSS

Still import both `@viewfoundry/editor/styles.css` and `@viewfoundry/react/styles.css` when using the editor.

## See also

- [Grid layout guide](grid-layout.md)
- [Changelog](changelog.md)
- [CHANGELOG.md on GitHub](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md)
