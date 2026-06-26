# Editor Specification

## MVP editor layout

```txt
┌───────────────────────────────────────────────┐
│ Toolbar                                       │
├──────────────┬─────────────────┬──────────────┤
│ Palette      │ Canvas          │ Inspector    │
│              │                 │              │
├──────────────┴─────────────────┴──────────────┤
│ Optional status bar                            │
└───────────────────────────────────────────────┘
```

## Required panels

### Palette

Shows registered components grouped by category.

Features:

- search/filter
- drag component to canvas
- click to insert selected component into root or selected container

### Canvas

Renders the current document with editor overlays.

Features:

- select node
- show selected outline
- show hover outline
- support drop targets
- empty state

### Layers panel

Can be MVP or Phase 2, but should be added early.

Features:

- tree view
- select node
- reorder nodes later
- delete node later

### Inspector

Generated from the selected component's prop schema.

Features:

- edit text/number/boolean/select/color/url/json
- update document on change
- show selected node type/id
- show missing schema warning

### Toolbar

Features:

- undo
- redo
- delete
- duplicate
- save/export hooks
- **Edit / Live toggle** — primary mode switcher (single viewport; see below)
- **edit sub-modes: Component Editor | Style Editor** (visible only in Edit mode)

## Edit mode and Live mode (single window)

**Priority: critical.** Users must toggle between editing and seeing the real UI **in one browser window** — not a split pane, not separate tabs, not a second route.

### Principle: one viewport

The canvas occupies the same screen region in both modes. Toggling swaps chrome and interaction layer only; the document does not reload and layout does not jump.

```txt
┌─────────────────────────────────────────────────────────┐
│ Toolbar   [ Edit ● | ○ Live ]   [ Component | Style ]   │  ← sub-modes only in Edit
├──────────┬──────────────────────────────────┬───────────┤
│ Palette  │                                  │ Inspector │
│ (Edit)   │     SAME CANVAS VIEWPORT         │ (Edit)    │
│ Layers   │                                  │           │
└──────────┴──────────────────────────────────┴───────────┘

Live mode: palette, layers, inspector, and selection overlays hidden;
           canvas expands to use freed space; runtime is fully interactive.
```

### Edit mode

Full studio chrome. User builds and modifies the document.

- palette, layers, inspector visible
- Component or Style sub-mode active
- selection overlays, drop targets, grid guides (when enabled)
- keyboard shortcuts for undo, delete, duplicate, etc.

### Live mode

Production-like view of the same document in the **same canvas area**.

- no palette, layers panel, or inspector
- no selection outlines or drag handles
- document rendered through `@viewfoundry/react` with real component interactivity (buttons click, inputs focus, etc.)
- toolbar retains **Edit | Live** toggle (and optional device frame later) so return to editing is one click
- document state is identical to Edit mode — Live is a view, not a copy

### Toggle behavior

| Requirement | Detail |
|-------------|--------|
| Single window | No side-by-side editor + preview; no dedicated preview route |
| Same viewport | Canvas element or region reused; no full-page swap |
| Preserve state | Selection, scroll position, and document unchanged across toggle |
| Fast | Instant chrome show/hide; no remount flicker where avoidable |
| Obvious | Edit/Live control is always visible in toolbar |

### Anti-patterns (do not ship in studio / docs embed)

- separate Editor tab and Preview tab that replace the entire page (interim `basic-react` example only)
- 50/50 split pane with editor left and preview right
- opening Live mode in a new window or iframe unless host app explicitly opts in

## Editor sub-modes (Edit mode only)

When **Edit** is active, users switch between structural and visual editing:

### Component Editor mode (default)

Structural and behavioral editing. Ships in Phase 4 (Editor MVP).

Features:

- component palette and drag/drop insert
- layers panel
- prop inspector driven by component schema
- select, move, delete, duplicate, nest nodes
- canvas selection and drop-target overlays
- **grid layout drag/drop** for repositioning on canvas (Phase 5)

Use when building layout and wiring component props.

### Style Editor mode

Visual presentation editing for the selected node. Planned in Phase 7.

Features:

- style inspector (spacing, colors, typography, borders, size, layout, opacity)
- edits `node.style` (`StyleTokenMap`) rather than component `props`
- canvas shows style-focused overlays; palette hidden or disabled
- optional token presets from the host app (brand colors, spacing scale)

Use when tuning appearance without changing component identity or schema-backed props.

## Mode switching

```txt
Toolbar:  [ Edit | Live ]     ← primary toggle (single viewport)

When Edit:
  [ Component | Style ]       ← edit sub-modes
  palette + inspector + overlays visible

When Live:
  chrome hidden; same canvas shows interactive runtime output
```

Rules:

- **Edit / Live** is the top-level toggle; optimize for one browser window
- Component and Style are sub-modes only available in Edit
- selection is preserved when switching Component ↔ Style and when returning Edit ← Live
- Live disables editor mutations and shortcuts; component interactivity enabled
- undo/redo history is shared across Component and Style edits (not cleared by Live toggle)

## Grid layout and layout drag/drop

**This is a core product requirement.** ViewFoundry should make arranging components on a grid feel intuitive, precise, and satisfying. Phase 4 ships basic palette → canvas insert; **Phase 5** delivers the full grid system and layout drag/drop.

### Goals

- users think in rows, columns, and cells — not abstract tree order alone
- dragging a component on the canvas is the primary way to move and reorder it
- every drop has an obvious target before release
- motion and snap feedback make editing feel responsive and polished

### Grid model

Grid containers define the layout frame. Children carry placement metadata:

```ts
type GridPlacement = {
  column?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
};

type GridContainerProps = {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  minRowHeight?: number | string;
};
```

Placement may live on `ViewNode.layout` (see `docs/DOCUMENT_MODEL.md`) or on grid-aware container props — pick one canonical shape during implementation.

### Canvas drag/drop behavior

| Action | Behavior |
|--------|----------|
| Drag from palette | Ghost follows cursor; valid cells highlight; snap on drop |
| Drag existing node | Lift animation; source cell shows placeholder; drop updates placement |
| Hover | Cell border glow + insertion line showing landing zone |
| Invalid target | Disabled cursor + no snap (e.g. disallowed child type) |
| Cancel (Escape) | Restore original position |

### Visual feedback

- faint grid lines on containers in Component Editor mode
- active drop target uses stronger border and background tint
- dragged item uses elevated shadow and reduced opacity ghost
- brief settle animation on successful drop

### Implementation notes

- use **dnd-kit** for pointer sensors, collision detection, and drag overlays
- layout mutations flow through `moveNode` / grid placement commands for undo/redo
- runtime renders grid containers with CSS Grid so WYSIWYG matches output
- layers panel row order reflects grid reading order (row-major by default)

### Out of scope for first grid pass

- free-form absolute positioning (Figma-style)
- fractional track resizing by dragging gutters (later)
- multi-select drag (later)

## Keyboard shortcuts

MVP shortcuts:

- Delete/Backspace: delete selected node
- Cmd/Ctrl+Z: undo
- Cmd/Ctrl+Shift+Z: redo
- Cmd/Ctrl+C: copy selected node
- Cmd/Ctrl+V: paste node
- Escape: clear selection

## Styling guidance

Use clean, neutral styling. Avoid coupling to a specific design system. The editor should be skinnable later.

## Accessibility

Editor controls should be keyboard accessible. The generated content itself may not always be accessible, but editor chrome should be.
