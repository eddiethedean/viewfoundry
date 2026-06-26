# Implementation Roadmap

## Phase 0: Repository foundation

Deliverables:

- pnpm workspace
- TypeScript config
- package structure
- build tooling
- Vitest setup
- lint/format scripts
- basic example app

Acceptance criteria:

- `pnpm install` works
- `pnpm build` works
- `pnpm test` works
- all packages compile

## Phase 1: Core engine

Deliverables:

- document model
- node utilities
- component registry
- validation
- command system
- history system
- selection model

Acceptance criteria:

- can create document
- can insert/move/delete/update nodes
- can undo/redo
- registry detects duplicate component types
- validation catches missing component types and duplicate node IDs

## Phase 2: Schema helpers

Deliverables:

- `defineComponent`
- prop field builders
- default prop generation
- simple prop validation

Acceptance criteria:

- component definitions are typed
- inspector can consume prop schemas
- default props are applied when inserting nodes

## Phase 3: React runtime

Deliverables:

- `ViewFoundryProvider`
- `ViewRenderer`
- component resolver
- missing component fallback
- hooks

Acceptance criteria:

- JSON document renders as React
- children render recursively
- missing component renders a clear placeholder
- runtime does not require editor package

## Phase 4: Editor MVP (Component Editor mode)

Deliverables:

- editor shell
- **Component Editor mode** — default editing experience for structure and props
- palette
- canvas
- prop inspector
- toolbar
- selection overlay
- drag/drop insert
- delete/duplicate
- undo/redo
- **Edit / Live toggle** — single-viewport switch between studio chrome and interactive runtime (critical)
- mode switcher for edit sub-modes (Component active; Style planned)

Component Editor mode scope:

- insert, select, move, delete, and duplicate nodes
- edit component props via schema-driven inspector
- layers panel for tree navigation
- canvas overlays for selection and drop targets
- **basic** palette → canvas drag/drop (full grid layout drag/drop in Phase 5)

Acceptance criteria:

- user can build a small UI visually in Component Editor mode
- props update live
- JSON state can be saved and reloaded
- editor opens in Edit mode by default
- **Edit ↔ Live toggle uses one canvas viewport** — no split pane or separate preview page
- Live mode hides editor chrome and shows interactive runtime output in the same window
- basic drag/drop insert works (palette → canvas); **grid-based layout drag/drop is Phase 5**

## Phase 5: Grid layout system and layout drag/drop

**Priority: critical.** The editor must feel intuitive and satisfying when arranging components. Grid-based layout with polished drag-and-drop is a core product requirement, not a polish pass.

Deliverables:

- **grid layout model** in the document (grid containers, tracks, gaps, and child placement)
- first-class **Grid**, **Row**, and **Cell** (or equivalent) container components in examples/registry
- canvas **layout drag/drop** — reposition and reorder components by dragging directly on the grid
- snap-to-cell behavior with visible grid lines and drop targets
- drag ghost / placeholder preview while moving
- insertion indicators (highlight target cell, row, or column before drop)
- `moveNode` commands integrated with grid placement updates
- dnd-kit-based pointer handling with smooth animations
- layers panel reorder synced with grid position

Grid system scope:

- CSS Grid–aligned mental model: columns, rows, `gap`, `colSpan`, `rowSpan`, `gridArea`
- children declare placement relative to a grid container node
- empty cells remain droppable; dragging out of a cell removes or reflows as defined by rules
- responsive track presets optional later (12-col, auto-fit, fixed sidebar layouts)
- validation for out-of-bounds placement and overlapping spans where disallowed

Drag-and-drop UX bar:

- drops should feel **immediate, predictable, and satisfying** — magnetic snap, clear affordances, no ambiguous landing zones
- hover states show exactly where a component will land before mouse release
- undo/redo restores grid position, not just tree order
- keyboard alternatives for move left/right/up/down between cells

Acceptance criteria:

- user can build a multi-column layout entirely by dragging on the canvas grid
- repositioning an existing component updates document JSON with correct grid placement
- drag from palette lands in the intended cell on first try in common cases
- grid state round-trips through save/load and renders correctly in preview
- interaction quality is demo-ready (Read the Docs studio and LessonKit both depend on this feel)

## Phase 6: Codegen

Deliverables:

- TSX generation
- import map
- warnings
- tests

Acceptance criteria:

- sample document generates readable TSX
- generated code is deterministic
- unsupported values produce warnings

## Phase 7: Style Editor mode

Deliverables:

- **Style Editor mode** — separate editing mode for visual styling of selected nodes
- `style` field on `ViewNode` (`StyleTokenMap` in document model)
- style inspector panel (spacing, size, colors, typography, border, layout, opacity)
- style commands (`updateNodeStyle`, `setStyleProp`) with undo/redo support
- toolbar mode switcher: **Edit** with **Component | Style** sub-modes, plus **Live** toggle (single viewport)
- canvas affordances in Style mode (style-only overlays, no palette insert)
- optional design-token presets developers can register

Style Editor mode scope:

- edit presentation properties without changing component type or prop schema values
- show only style-relevant controls for the selected node
- persist styles in document JSON separately from `props`
- codegen emits styles as inline styles, class names, or `style` prop mappings (TBD per component)

Acceptance criteria:

- user can switch from Component Editor to Style Editor without losing selection
- style changes update the canvas live and survive save/load
- style edits undo/redo correctly
- Component Editor and Style Editor do not conflict (structure edits in one mode, presentation edits in the other)
- validation catches invalid style values where rules exist

## Phase 8: CLI and examples

Deliverables:

- `viewfoundry init`
- `viewfoundry export`
- basic example
- dashboard example
- landing page example

Acceptance criteria:

- developer can scaffold a working example
- docs explain integration flow

## Phase 9: Documentation site (Read the Docs)

Deliverables:

- Read the Docs project and build config (`.readthedocs.yaml`)
- `apps/docs` prose documentation (getting started, package guides, API overview)
- example **Studio UI** embedded in the docs — a live `ViewFoundryEditor` demo visitors can use without cloning the repo
- static build step that compiles the studio bundle and ships it with the docs output
- CI-friendly docs build (`pnpm docs:build` or equivalent)

Studio UI scope:

- reuse the `examples/basic-react` component library (Button, Card, Stack, Heading, Text) or a slimmed `apps/playground` variant
- **single-window Edit / Live toggle** in the embedded studio (not separate editor and preview tabs)
- JSON view and TSX export surfaced in the docs page (panel or drawer, not a second full-page mode)
- no backend required for MVP — in-browser state only (optional localStorage)

Acceptance criteria:

- Read the Docs build succeeds from `main`
- docs site includes at least one page with a working embedded studio
- studio loads from the same RTD deployment (no separate dev server)
- prose docs link to the live demo and to `examples/basic-react` for local development
- studio uses one viewport for Edit and Live modes

## Phase 10: LessonKit integration

Deliverables:

- LessonKit component definitions
- LessonKit document adapter
- editor shell integration plan
- LXPack export adapter later

Acceptance criteria:

- a LessonKit lesson can be visually edited using ViewFoundry
- LessonKit-specific schema is preserved
- ViewFoundry remains generic
