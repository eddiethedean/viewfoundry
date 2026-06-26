# Grid layout

ViewFoundry **v0.3.0** adds CSS Grid–based layout with canvas drag-and-drop. This guide covers the document model, layout components, editor behavior, and codegen.

## Mental model

- A **grid container** (`Grid` or `Row` in the demo) defines columns, rows, and gap via component props.
- **Child nodes** declare placement with `layout.grid` on `ViewNode` — column, row, `colSpan`, and `rowSpan`.
- Placement is stored separately from `props` and `style` so structure edits and layout edits stay distinct.

```ts
type GridPlacement = {
  column?: number; // 1-based
  row?: number;
  colSpan?: number;
  rowSpan?: number;
};

type NodeLayout = {
  grid?: GridPlacement;
};

type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  layout?: NodeLayout;
};
```

## Register layout components

Your host app must register grid container components like any other editable type. The [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react) demo registers `Grid` and `Row`:

```ts
import { defineComponent, number } from '@viewfoundry/schema';

export const GridDefinition = defineComponent(Grid, {
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: ['Button', 'Card', 'Stack', 'Grid', 'Row', 'Heading', 'Text'],
  props: {
    columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
    rows: number({ label: 'Rows', defaultValue: 2, min: 1, max: 12 }),
    gap: number({ label: 'Gap', defaultValue: 8, min: 0, max: 64 }),
  },
});
```

`acceptsChildren` and `allowedChildren` control where palette items can be inserted.

## Canvas drag-and-drop

The editor uses **dnd-kit** for palette and canvas interactions:

1. **Palette → canvas** — drag a component onto a grid cell; the editor inserts the node with placement for that cell.
2. **Node reposition** — drag an existing node to another cell; `moveNode` updates parent and `layout.grid`.
3. **Empty canvas bootstrap** — when the root has no layout children, the editor inserts a default `Grid` container automatically.

Visual feedback includes drag ghosts, per-cell drop targets, and grid lines on layout containers.

## Keyboard nudge

With a node selected on the grid, use **arrow keys** to nudge placement between adjacent cells. The editor store exposes `nudgeNodeLayout` for programmatic use.

## Commands and validation

Core commands that understand grid placement:

| Command         | Purpose                                                |
| --------------- | ------------------------------------------------------ |
| `insertNode`    | Optional `layout` on the payload for initial placement |
| `moveNode`      | Optional `layout` when changing parent or cell         |
| `setNodeLayout` | Update `layout.grid` on an existing node               |

`validateDocument()` checks out-of-bounds spans and overlapping placements within grid containers.

## Codegen

`generateTsx` emits inline styles for grid children:

```tsx
<div style={{ gridColumn: '2 / span 2', gridRow: '1' }}>...</div>
```

Register grid container components in your import map like any other type.

## React provider hooks

For custom editor shells, `@viewfoundry/react` exposes optional hooks on `ViewFoundryProvider`:

- `wrapEditNode` — wrap rendered nodes in edit mode (selection chrome)
- `renderGridDropLayer` — render per-cell drop targets over grid containers

The stock `ViewFoundryEditor` wires these internally; you only need them when composing a custom canvas.

## Layers panel

The layers panel lists children in **grid reading order** (row-major by placement) so the tree matches what you see on the canvas.

## See also

- [Getting started](getting-started.md)
- [Architecture — document model](architecture.md#document-model)
- [Migration from 0.2 → 0.3](migration-0.2-0.3.md)
