# Editor Specification

Studio usability standards (plain language, safe defaults, progressive disclosure) are in [UX_AND_DX.md](UX_AND_DX.md). This spec covers layout and behavior.

**Modes:** v0.1–v0.6 shipped **embed mode** (JSON document). From **v0.7**, the target layout follows **code-first** editing with Codux-inspired panels and Figma/Wix-inspired Stage DnD. See [CODE_FIRST.md](CODE_FIRST.md) and [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

## Target layout (code-first, v0.7+)

```txt
┌──────────────────────────────────────────────────────────────────┐
│ Toolbar  [ Board ▾ | App ▾ ]  [ Edit ● | ○ Live ]  [ C | S | I ] │
│          viewport W×H   [ Open in browser ]                       │
├──────────────┬───────────────────────────────┬───────────────────┤
│ Add Elements │         STAGE                 │ Properties        │
│ (v0.9)       │   (canvas + overlays)         │ (props)           │
│              │                               │                   │
│ Elements     │                               │ Styles (v0.8)     │
│ (tree)       │                               │ Theme Mgr (v0.8)  │
├──────────────┴───────────────────────────────┴───────────────────┤
│ Optional status / sync indicator                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Panel glossary (Codux-inspired)

| Panel               | Role                                                              | Release                   |
| ------------------- | ----------------------------------------------------------------- | ------------------------- |
| **Stage**           | Render surface; selection overlays; drop targets; viewport sizing | v0.7 (rename from Canvas) |
| **Elements**        | DOM/component tree; multi-select; reading order hints             | v0.7 (evolves Layers)     |
| **Properties**      | Prop controls from TS types + schema; links, media pickers        | v0.7 (evolves Inspector)  |
| **Styles**          | Visual CSS controllers on real stylesheets; class selector        | v0.8                      |
| **Computed styles** | Read-only cascade; click-through to Styles                        | v0.8                      |
| **Theme Manager**   | Global CSS variables, fonts                                       | v0.8                      |
| **Add Elements**    | Categorized insert: HTML, layouts, components, blocks, libs       | v0.9                      |
| **Pages**           | Route list when editing full app                                  | v0.10                     |
| **Board settings**  | Viewport, background, tags, “show in Add Elements”                | v0.7                      |

### Board vs App tabs

- **Board tab** — isolated `.board.tsx` fixture (component development).
- **App tab** — full page/route TSX (application editing, **v0.10**).

Only one Stage viewport; tab switch preserves Edit/Live mode.

## Code-first layout tools (v0.7+)

ViewFoundry uses **registered layout components** — not absolute X/Y positioning. See [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

| Tool        | CSS                            | Drop behavior                                 |
| ----------- | ------------------------------ | --------------------------------------------- |
| **Stack**   | Flex row/column                | Reorder siblings; fixed gap; prevents overlap |
| **Grid**    | CSS Grid                       | Cell placement; col/row span                  |
| **Section** | Section wrapper + inner layout | Page regions (**v0.10**)                      |
| **Box**     | Generic container              | Reparent only                                 |

### Stage drag-and-drop (code-first)

All operations must satisfy the [global DnD bar](UX_AND_DX.md#global-dnd-quality-bar-v07).

| Action                        | Behavior                                                 |
| ----------------------------- | -------------------------------------------------------- |
| Drag from Add Elements (v0.9) | Ghost + dashed valid zone; insert JSX + import           |
| Alt/Option + drop (v0.9)      | Swap selected component type where schema allows         |
| Drag existing element         | Reparent or reorder; lift animation + source placeholder |
| Drag in Elements tree         | Reorder siblings; sync Stage                             |
| Multi-select drag (v0.12)     | Shared ghost; group move                                 |
| Hover valid Stack/Grid cell   | Border glow + insertion indicator                        |
| Invalid target                | Blocked cursor + label (“Card cannot go inside Text”)    |
| Cancel (Escape)               | Restore original structure                               |
| Snap                          | Cell/edge snap; hold modifier to disable (Figma pattern) |
| On drop success               | ~150–200ms settle animation                              |

### Canvas click mode (v0.7)

Toolbar or Settings toggle (Wix Studio pattern):

- **Parent first** — click selects container; second click selects child
- **Child first** — click selects deepest element under cursor

### Smart guides (v0.7)

While dragging or resizing on Stage:

- Alignment lines to sibling edges and centers (Figma smart guides)
- Optional distance labels (px) to nearest sibling or container edge
- Faint grid lines on Grid containers in Edit mode (embed-mode parity)

### Sizing vocabulary (v0.8)

Properties or Styles panel exposes Figma-aligned labels:

- **Hug contents** → `fit-content` / shrink-to-fit
- **Fill container** → flex grow / `1fr`
- **Fixed** → explicit width/height

## Embed mode layout (shipped v0.1–v0.6)

Legacy JSON document editing keeps the original three-column layout until hosts migrate:

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

Can ship in v0.1.0 or early v0.2.x; should be added early.

Features:

- tree view
- select node
- reorder nodes later
- delete node later

### Pages panel (planned v0.9.0)

Multi-route site editing. See `docs/ROUTING.md`.

Features:

- list routes (label + path)
- add, duplicate, delete, switch active route
- route path and meta inspector
- each route loads its own `ViewDocument` into the canvas

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
- **edit sub-modes: Component Editor | Style Editor | Interactions** (Component and Style active; Interactions in **v0.8.0**)

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

| Requirement    | Detail                                                           |
| -------------- | ---------------------------------------------------------------- |
| Single window  | No side-by-side editor + preview; no dedicated preview route     |
| Same viewport  | Canvas element or region reused; no full-page swap               |
| Preserve state | Selection, scroll position, and document unchanged across toggle |
| Fast           | Instant chrome show/hide; no remount flicker where avoidable     |
| Obvious        | Edit/Live control is always visible in toolbar                   |

### Anti-patterns (do not ship in studio / docs embed)

- separate Editor tab and Preview tab that replace the entire page (interim `basic-react` example only)
- 50/50 split pane with editor left and preview right
- opening Live mode in a new window or iframe unless host app explicitly opts in

## Editor sub-modes (Edit mode only)

When **Edit** is active, users switch between structural and visual editing:

### Component Editor mode (default)

Structural and behavioral editing. Shipped in **v0.1.0**; refined through **v0.3.0** grid work.

Features:

- component palette and drag/drop insert
- layers panel
- prop inspector driven by component schema
- select, move, delete, duplicate, nest nodes
- canvas selection and drop-target overlays
- **grid layout drag/drop** for repositioning on canvas (**v0.3.0**)

Use when building layout and wiring component props.

### Style Editor mode

Visual presentation editing for the selected node. **Shipped in v0.4.0.**

Features:

- style inspector (spacing, colors, typography, borders, size, layout, opacity)
- edits `node.style` (`StyleTokenMap`) rather than component `props`
- canvas shows style-focused overlays; palette hidden or disabled
- optional token presets from the host app (brand colors, spacing scale)

Use when tuning appearance without changing component identity or schema-backed props.

### Interactions Editor mode

Behavior wiring in source. Planned in **v0.11.0** (code-first). See `docs/INTERACTIONS.md`.

Features:

- interactions list panel (rules written as TSX handlers)
- create flow: select source → pick trigger → define effect → pick targets
- validation cites component labels
- handlers run in **Live** mode only

Embed mode: optional JSON `interactions[]` interpreter retained for CMS hosts — not extended pre-1.0.

## Mode switching

```txt
Toolbar:  [ Edit | Live ]     ← primary toggle (single viewport)

When Edit:
  [ Component | Style | Interactions ]   ← Style v0.8 code-first; Interactions v0.11
  palette + inspector + overlays visible

When Live:
  chrome hidden; same canvas shows interactive runtime output (including interaction triggers)
```

Rules:

- **Edit / Live** is the top-level toggle; optimize for one browser window
- Component, Style, and Interactions are sub-modes only available in Edit
- selection is preserved when switching sub-modes and when returning Edit ← Live
- Live disables editor mutations and shortcuts; component interactivity and **interaction triggers** enabled
- undo/redo history is shared across Component, Style, and Interaction edits (not cleared by Live toggle)

## Grid layout and layout drag/drop (embed mode)

**Embed mode requirement (shipped v0.3).** JSON documents use `layout.grid` and canvas drag/drop. Apply the [global DnD quality bar](UX_AND_DX.md#global-dnd-quality-bar-v07) on Canvas where applicable. **Code-first (v0.7+)** uses Stack/Grid JSX + Stage DnD above — not JSON `layout.grid`.

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

| Action             | Behavior                                                              |
| ------------------ | --------------------------------------------------------------------- |
| Drag from palette  | Ghost follows cursor; valid cells highlight; snap on drop             |
| Drag existing node | Lift animation; source cell shows placeholder; drop updates placement |
| Hover              | Cell border glow + insertion line showing landing zone                |
| Invalid target     | Disabled cursor + no snap (e.g. disallowed child type)                |
| Cancel (Escape)    | Restore original position                                             |

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

### Out of scope

- free-form absolute positioning as default (Wix Classic) — conflicts with responsive React/CSS
- fractional track resizing by dragging gutters — post-1.0
- silent auto-layout rewrite without user confirm — suggest only

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
