# Roadmap

Releases are versioned **v0.X** milestones. Each version ships a coherent slice of capability. Earlier internal “Phase N” planning maps to these releases as noted below.

## Release overview

| Version                                 | Status       | Theme                                        |
| --------------------------------------- | ------------ | -------------------------------------------- |
| [v0.1.0](#v010---sdk-foundation)        | **Released** | Core SDK, basic editor, codegen, example app |
| [v0.2.0](#v020---edit--live-studio)     | **Released** | Single-window Edit / Live toggle             |
| [v0.3.0](#v030---grid-layout--dragdrop) | **Released** | Grid system and satisfying layout drag/drop  |
| [v0.4.0](#v040---style-editor)          | Planned      | Style Editor sub-mode and `node.style`       |
| [v0.5.0](#v050---cli--examples)         | Planned      | CLI scaffolding and additional examples      |
| [v0.6.0](#v060---documentation-site)    | Planned      | Read the Docs site with embedded studio      |
| [v0.7.0](#v070---lessonkit-integration) | Planned      | LessonKit adapter and flagship integration   |

---

## v0.1.0 — SDK foundation

**Status: released**

Ships the embeddable SDK: document engine, schema helpers, React runtime, visual editor MVP, TSX codegen, and a working example.

### Deliverables

- pnpm monorepo, TypeScript, Vitest, build tooling
- `@viewfoundry/core` — document model, registry, commands, history, selection, validation
- `@viewfoundry/schema` — `defineComponent`, prop field builders, defaults, validation
- `@viewfoundry/react` — `ViewFoundryProvider`, `ViewRenderer`, hooks, missing-component fallback
- `@viewfoundry/editor` — editor shell, Component Editor mode, palette, canvas, prop inspector, toolbar, layers panel, basic palette → canvas drag/drop, undo/redo
- `@viewfoundry/codegen` — `generateTsx`, import maps, warnings
- `@viewfoundry/cli` / `@viewfoundry/vite` — stubs
- `examples/basic-react` — demo with Button, Card, Stack, Heading, Text; localStorage persistence; TSX export

### Acceptance criteria

- `pnpm install`, `pnpm build`, `pnpm test`, and `pnpm typecheck` pass
- user can build a small UI visually and edit props live
- JSON document saves, loads, renders as React, and exports to readable TSX
- runtime does not require the editor package

### Known gaps (addressed in later releases)

- palette insert only; no grid layout drag/drop yet → **v0.3.0**
- no Style Editor sub-mode → **v0.4.0**

---

## v0.2.0 — Edit / Live studio

**Status: released**

**Priority: critical.** One browser window; same canvas viewport for editing and live preview.

### Deliverables

- **Edit / Live toggle** in `@viewfoundry/editor` — primary toolbar control
- single viewport: chrome hides in Live mode; canvas region reused (no full-page swap)
- Live mode renders interactive runtime output via `@viewfoundry/react`
- edit sub-mode switcher placeholder (Component active; Style in **v0.4.0**)
- refactor `examples/basic-react` to single-window Edit / Live (remove Editor / Preview tabs)
- preserve selection, scroll position, and document across toggle

### Acceptance criteria

- editor opens in Edit mode by default
- Edit ↔ Live uses one canvas viewport — no split pane or separate preview route
- Live mode hides palette, layers, inspector, and selection overlays
- components remain interactive in Live mode (buttons click, inputs focus)
- toggle is instant with no document reload

---

## v0.3.0 — Grid layout & drag/drop

**Status: released**

**Priority: critical.** Intuitive grid-based layout with polished, satisfying canvas drag/drop.

### Deliverables

- **grid layout model** in the document (`NodeLayout`, grid placement on `ViewNode`)
- first-class **Grid**, **Row**, and **Cell** (or equivalent) container components
- canvas **layout drag/drop** — reposition and reorder by dragging on the grid
- snap-to-cell behavior, visible grid lines, drop targets, drag ghost, insertion indicators
- `moveNode` commands integrated with grid placement; undo/redo restores grid position
- dnd-kit-based pointer handling with smooth animations
- layers panel order synced with grid reading order

### Grid scope

- CSS Grid mental model: columns, rows, `gap`, `colSpan`, `rowSpan`, `gridArea`
- children declare placement relative to a grid container
- validation for out-of-bounds and overlapping spans
- keyboard nudge between cells

### Acceptance criteria

- user can build a multi-column layout entirely by dragging on the canvas grid
- repositioning updates document JSON with correct grid placement
- palette drag lands in the intended cell in common cases
- grid state round-trips through save/load and renders correctly in Live mode
- interaction quality is demo-ready (RTD studio and LessonKit depend on this feel)

---

## v0.4.0 — Style Editor

### Deliverables

- **Style Editor sub-mode** (Edit mode only, alongside Component Editor)
- `style` field on `ViewNode` (`StyleTokenMap`)
- style inspector: spacing, size, colors, typography, border, layout, opacity
- style commands (`updateNodeStyle`, `setStyleProp`) with undo/redo
- toolbar: **Edit** with **Component | Style** sub-modes + **Live** toggle
- optional design-token presets registered by host apps
- codegen emits styles (inline, class names, or mapped props — TBD)

### Acceptance criteria

- user switches Component ↔ Style without losing selection
- style changes update canvas live and survive save/load
- style edits undo/redo correctly; no conflict with structure edits
- validation catches invalid style values where rules exist

---

## v0.5.0 — CLI & examples

### Deliverables

- `viewfoundry init` — scaffold a working project
- `viewfoundry export` — full CLI export flow
- `viewfoundry validate` — document validation
- `examples/dashboard-builder`
- `examples/landing-page`
- integration guides in repo docs

### Acceptance criteria

- developer can scaffold and run a working example from the CLI
- additional examples demonstrate real-world layouts
- docs explain end-to-end integration flow

---

## v0.6.0 — Documentation site

### Deliverables

- Read the Docs project and `.readthedocs.yaml`
- `apps/docs` — Sphinx or MyST prose (getting started, package guides, API overview)
- **embedded Studio UI** — static `ViewFoundryEditor` build shipped inside the docs site
- `pnpm docs:build` compiles studio bundle and copies assets into docs output
- single-window **Edit / Live** in the embed; JSON and TSX export in a panel or drawer

### Acceptance criteria

- Read the Docs build succeeds from `main`
- at least one docs page includes a working embedded studio
- studio loads from the same RTD deployment (no separate dev server)
- studio uses one viewport for Edit and Live modes

---

## v0.7.0 — LessonKit integration

### Deliverables

- LessonKit component definitions mapped to ViewFoundry registry
- LessonKit document adapter (blocks ↔ `ViewDocument`)
- editor shell integration plan for LessonKit Studio
- LXPack export adapter (later within this release cycle)

### Acceptance criteria

- a LessonKit lesson can be visually edited using ViewFoundry
- LessonKit-specific schema is preserved via adapters
- ViewFoundry core packages remain LessonKit-agnostic

---

## Versioning notes

- **v0.1.x** — patch fixes and non-breaking SDK improvements on the foundation release
- **v0.X.0** — minor releases add capabilities; document model may gain optional fields (`layout`, `style`) with backward-compatible defaults
- **v1.0.0** — reserved for a stable public API and any breaking document-model or package-surface changes after LessonKit and docs site are proven
