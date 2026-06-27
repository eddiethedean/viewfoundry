# Roadmap

Releases are versioned **v0.X** milestones. Each version ships a coherent slice of capability. Earlier internal “Phase N” planning maps to these releases as noted below.

## Release overview

| Version                                         | Status       | Theme                                            |
| ----------------------------------------------- | ------------ | ------------------------------------------------ |
| [v0.1.0](#v010---sdk-foundation)                | **Released** | Core SDK, basic editor, codegen, example app     |
| [v0.2.0](#v020---edit--live-studio)             | **Released** | Single-window Edit / Live toggle                 |
| [v0.3.0](#v030---grid-layout--dragdrop)         | **Released** | Grid system and satisfying layout drag/drop      |
| [v0.4.0](#v040---style-editor)                  | **Released** | Style Editor sub-mode and `node.style`           |
| [v0.5.0](#v050---cli--examples)                 | **Released** | `init`, Vite plugin, additional examples         |
| [v0.6.0](#v060---documentation-site)            | **Released** | Read the Docs site with embedded studio          |
| [v0.7.0](#v070---code-first-foundation--boards) | Planned      | Direct TSX/CSS editing, boards, sync layer       |
| [v0.8.0](#v080---styles-panel--theme-manager)   | Planned      | Visual CSS editing, variables, computed styles   |
| [v0.9.0](#v090---add-elements--discovery)       | Planned      | Add Elements panel, open existing React projects |
| [v0.10.0](#v0100---app-pages--routing)          | Planned      | Full-page editing, Pages panel, client routing   |
| [v0.11.0](#v0110---interactions--triggers)      | Planned      | Event handlers and declarative wiring in source  |
| [v0.12.0](#v0120---clipboard--saved-blocks)     | Planned      | Copy/paste subtrees & saved block library        |
| [v0.13.0](#v0130---responsive--design-tokens)   | Planned      | Breakpoint preview & theme tokens in CSS         |
| [v1.0.0](#v100---stable-api)                    | Planned      | Stable code-first public API; embed mode frozen  |

### Post-1.0

| Version                                   | Status      | Theme                             |
| ----------------------------------------- | ----------- | --------------------------------- |
| [v1.1.0](#v110---nested-routes--layouts)  | Planned     | Nested routes & shared layouts    |
| [v1.2.0](#v120---framework-adapters)      | Planned     | Next.js and other router adapters |
| [v1.3.0](#v130---async-data--loaders)     | Planned     | Route/node data loaders           |
| [v1.4.0](#v140---plugin-api)              | Planned     | Extension & plugin API            |
| [v1.5.0+](#v150--collaboration--advanced) | Exploratory | Collaboration, i18n, a11y, motion |

### Embed-mode backlog (JSON document path)

Features below were planned on the JSON model. They ship **after v1.0** only if embed/CMS customers need them — not on the code-first critical path. See [CODE_FIRST.md](CODE_FIRST.md).

| Former milestone | Topic                         | Status                                    |
| ---------------- | ----------------------------- | ----------------------------------------- |
| v0.10 slots      | Named slots in ViewDocument   | Backlog — JSX slots covered by code-first |
| v0.11 bindings   | Variables, conditions in JSON | Backlog — use React state in source       |
| v0.12 repeat     | List templates in JSON        | Backlog — `.map()` in source              |
| v0.14 forms      | Form patterns in JSON         | Backlog — evaluate post-1.0               |

See [POST_1_0.md](POST_1_0.md) for post-1.0 detail.

## UX & DX standards

Every milestone must meet the **studio user** and **React developer** bars in [UX_AND_DX.md](UX_AND_DX.md). Acceptance criteria in each section below are additive — they do not replace those global requirements.

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
- `@viewfoundry/cli` — `init`, `validate`, and `export`
- `@viewfoundry/vite` — document HMR via Vite plugin
- `examples/basic-react`, `examples/landing-page`, and `examples/dashboard-builder`

### Acceptance criteria

- `pnpm install`, `pnpm build`, `pnpm test`, and `pnpm typecheck` pass
- user can build a small UI visually and edit props live
- JSON document saves, loads, renders as React, and exports to readable TSX
- runtime does not require the editor package

### Known gaps (addressed in later releases)

- palette insert only; no grid layout drag/drop yet → **v0.3.0**
- no Style Editor sub-mode → **v0.4.0**
- no declarative interactions between components → **v0.11.0** (code-first handlers)
- no multi-route / multi-page sites → **v0.10.0** (source routes)
- no named slots in embed JSON → embed backlog; JSX children in code-first
- no data bindings or variables in embed JSON → embed backlog; React state in code-first
- manual `defineComponent` registration for every component → **v0.9.0** (project discovery)

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
- interaction quality is demo-ready (RTD studio depends on this feel)

---

## v0.4.0 — Style Editor

**Status: released**

### Deliverables

- **Style Editor sub-mode** (Edit mode only, alongside Component Editor)
- `style` field on `ViewNode` (`StyleTokenMap`)
- style inspector: spacing, size, colors, typography, border, layout, opacity
- style commands (`updateNodeStyle`, `setStyleProp`) with undo/redo
- toolbar: **Edit** with **Component | Style** sub-modes + **Live** toggle
- optional design-token presets registered by host apps
- codegen emits inline merged `style={{...}}` on components; grid placement uses wrapper divs; optional `styleTokens` resolve token references at export time

### Acceptance criteria

- user switches Component ↔ Style without losing selection
- style changes update canvas live and survive save/load
- style edits undo/redo correctly; no conflict with structure edits
- validation catches invalid style values where rules exist

---

## v0.5.0 — CLI & examples

**Status: released**

### Deliverables

- `viewfoundry init` — scaffold a working project
- `@viewfoundry/vite` — `virtual:viewfoundry/document` HMR, validation overlay, optional codegen watch
- `examples/dashboard-builder`
- `examples/landing-page` — single-page first; multi-route in **v0.9.0** (see [ROUTING.md](ROUTING.md))
- integration guides in repo docs — including **manual** wiring for existing React apps today
- **planned follow-up:** automated load/discovery of components from existing projects → **v0.9.0** (see [CODE_FIRST.md](CODE_FIRST.md))

`viewfoundry export` and `viewfoundry validate` shipped in **v0.2.0**.

### Acceptance criteria

- developer can scaffold and run a working example from the CLI
- additional examples demonstrate real-world layouts
- docs explain end-to-end integration flow

---

## v0.6.0 — Documentation site

**Status: released**

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

## Strategic pivot (v0.7+)

From **v0.7.0**, new work follows the **code-first** strategy in [CODE_FIRST.md](CODE_FIRST.md): React/TSX and CSS files are the source of truth; visual edits patch source. The v0.1–v0.6 **ViewDocument JSON** stack remains as **embed mode** for CMS-style products and the RTD Studio demo.

Editor UX takes lessons from **Codux** (boards, Stage, Elements/Properties/Styles panels, Add Elements, Theme Manager), **Figma** (auto layout semantics, smart guides, component swap), and **Wix Studio** (stacks/grids, responsive cascade, layers-driven DnD) while staying **embeddable** in host apps rather than a desktop IDE. See [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

---

## v0.7.0 — Code-first foundation & boards

**Status: planned**

**Priority: critical.** Establish direct source editing, component isolation boards, and **mature Stage drag-and-drop** (Figma/Wix feedback bar).

### Deliverables

- **`@viewfoundry/sync`** — TSX/JSX parse, DOM selection ↔ source location map, safe AST patches, file-level undo snapshots
- **`@viewfoundry/board`** — `createBoard()`, board types, test render helpers (`.board.tsx` convention)
- **bi-directional sync** — visual and IDE edits reflect via Vite HMR; `@viewfoundry/vite` project-root detection
- **Stage** — canvas rename; viewport width/height controls; board vs page tab model
- **Stage DnD feedback** — drag ghost, dashed valid drop zones, smart alignment guides, distance hints, snap with modifier to disable, settle animation on drop ([DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md))
- **Elements panel** — DOM/component tree; multi-select; drag-reorder; jump-to-source
- **canvas click mode** — parent-first vs child-first selection (Wix Studio pattern)
- **layout tools** — **Stack** (flex) and **Grid** registered components; drops reparent/reorder in JSX (not absolute X/Y)
- **Properties panel** — auto-generated from component props (TypeScript inference + optional `defineComponent` schema)
- **structure editing** — insert/reparent/delete/duplicate write JSX; plain-language invalid-drop errors
- **embed mode preserved** — `ViewDocument` + `ViewFoundryEditor` + `generateTsx` unchanged; dual-mode docs on RTD
- **example** — `examples/basic-react` code-first path alongside existing JSON demo

### Acceptance criteria

- user edits a registered component on a board; saved `.tsx` diff is readable hand-written React
- external IDE edit to the same file updates Stage within one HMR cycle
- undo/redo restores prior file content for structure edits
- drag from Elements or reparent on Stage shows ghost, highlights valid targets, and snaps; Escape cancels
- parent-first / child-first click mode selectable; obscured child selectable from Elements tree
- drop into Stack reorders siblings; drop into Grid updates placement in source
- embed mode JSON flow still passes existing e2e suite
- board renders with mocked props/providers documented in `.board.tsx`

### Known gaps (addressed in later releases)

- Hug/Fill/Fixed sizing and padding scrub handles → **v0.8.0**
- Add Elements panel + Alt+swap + project scan → **v0.9.0**
- full app page / Section editing → **v0.10.0**

---

## v0.8.0 — Styles panel & Theme Manager

**Status: planned**

**Priority: high.** Codux-quality visual CSS editing on real stylesheets; Figma-style sizing vocabulary.

### Deliverables

- **Styles panel** — spacing, size, color, typography, border, flex/grid controllers writing to CSS / CSS modules / SCSS
- **Hug / Fill / Fixed** sizing controls on selected elements (Figma auto layout → CSS flex/grid)
- **gap and padding scrub** — drag handles on Stage frame edges (Figma red-handle pattern) where applicable
- **Computed styles** — read-only cascade view; click value → jump to Styles controller
- **Theme Manager** — global CSS variables panel; create/edit/detach variables; optional Google Fonts import hook
- **Style sub-mode** under Edit (Component | Style | …); class selector picker tied to source files
- **CSS nesting** support where host project uses it
- **embed mode** — existing `node.style` Style Inspector retained for JSON path; not extended

### Acceptance criteria

- margin change on Stage updates the correct rule in the host stylesheet
- Hug/Fill/Fixed change writes expected flex/grid CSS (not absolute positioning)
- theme variable edit reflects in all components using that variable
- style edits undo/redo at file level without breaking JSX structure
- Tailwind projects: classes visible in Elements panel; visual class editing deferred to post-1.0

---

## v0.9.0 — Add Elements & project discovery

**Status: planned**

**Priority: high.** Open existing React projects and discover components (formerly v1.6.0).

### Deliverables

- **Add Elements panel** — categorized insert: HTML elements, **Stacks/Grids/Sections**, project components, third-party libs, board variants
- **drag insert** — ghost on Stage, dashed drop zone, valid-parent enforcement (Figma Assets pattern)
- **Alt/Option + drop** on selected element → **swap** component type (Figma instance swap)
- **quick insert** keyboard shortcut (search Add Elements without mouse)
- **overlap hint** — suggest “Stack these?” when adjacent siblings may overlap at smaller widths (Wix Studio pattern)
- **`@viewfoundry/discover`** — scan configured globs; list exported components; bootstrap `defineComponent` stubs
- **`viewfoundry import`** CLI — point at existing Vite/React/TS repo; generate registry + board templates
- **Project library** — board variants marked “show in Add Elements” appear as reusable inserts
- **component variants** — wrap configured prop/style permutations for drag-and-drop reuse
- **gradual adoption** — only confirmed components enter Add Elements

### Acceptance criteria

- developer opens an existing app without hand-writing every `defineComponent`
- drag from Add Elements inserts valid JSX with correct import; invalid parent shows blocked cursor + label
- Alt+drop replaces selected component with dragged type where schema allows
- variant from board appears in Add Elements after opt-in board setting
- JSON embed mode unaffected

---

## v0.10.0 — App pages & routing

**Status: planned**

**Priority: high.** Edit full application pages, not only isolated boards.

### Deliverables

- **App tab** alongside Board tabs — edit route/page TSX files directly on Stage
- **Section** layout component — page regions with inner grid/stack (Wix section model)
- **Pages panel** — list routes (React Router config or conventional `pages/` scan); add, switch, duplicate
- **cross-page section copy** — duplicate section JSX across routes with import rewrite
- **client routing** — Live mode navigates between pages; link component href editing in Properties
- **`@viewfoundry/vite`** — SPA dev fallback for multi-route preview
- **example** — multi-page `examples/landing-page` on code-first path
- **embed mode** — existing `ViewSite` / Pages panel on JSON deferred unless customer demand (see embed backlog)

See [ROUTING.md](ROUTING.md) for routing concepts; code-first implementation edits route files in source.

### Acceptance criteria

- user authors Home and About as separate page files and switches between them in the editor
- Live mode navigates via link or programmatic navigation in source
- nested layouts / shared parent routes → **v1.1.0**
- Next.js / file-based router adapters → **v1.2.0**

---

## v0.11.0 — Interactions & triggers

**Status: planned**

**Priority: high.** Wire component behavior in source — not JSON interaction arrays.

See [INTERACTIONS.md](INTERACTIONS.md) for concepts; code-first implementation emits TSX handlers.

### Deliverables

- **Interactions sub-mode** — sentence UI: “When [Button] clicked → …” writes handler props or `onClick` in TSX
- **registry metadata** — `events` on `ComponentDefinition` for discoverable triggers
- **safe patterns** — generated handlers use host conventions (e.g. lift state, callback props); no arbitrary `eval`
- **Live preview** — handlers run in Live mode; Edit mode does not fire accidentally
- **embed mode** — optional JSON `interactions[]` interpreter retained for CMS embeds only

### Acceptance criteria

- user wires button click → update heading text; resulting TSX is idiomatic React
- invalid target surfaces error with component label, not raw id
- interaction edit undo/redo restores handler code
- embed JSON interactions still work if enabled (no regression)

---

## v0.12.0 — Clipboard & saved blocks

**Status: planned**

**Priority: medium.** Author productivity on JSX subtrees.

See [CLIPBOARD_AND_BLOCKS.md](CLIPBOARD_AND_BLOCKS.md).

### Deliverables

- copy/paste JSX subtree (keyboard + toolbar); paste rewrites imports as needed
- cross-page paste within app
- **multi-select drag** on Stage — move group with shared ghost (Wix multi-element handles)
- **saved blocks** — persist JSX snippets to project library; Add Elements “Blocks” category; drag to insert
- file-level undo integration

### Acceptance criteria

- copy Card subtree, paste into Grid on another page; imports resolve
- save hero section as block; insert twice; independent edits produce separate diffs

---

## v0.13.0 — Responsive & design tokens

**Status: planned**

**Priority: medium.** Breakpoint preview and token-aware CSS; Wix Studio responsive cascade.

See [RESPONSIVE.md](RESPONSIVE.md) and [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

### Deliverables

- **breakpoint switcher** on Stage (Mobile / Tablet / Desktop presets + custom)
- **cascade vs override** indicators — inherited from desktop vs custom on this breakpoint (Wix Studio)
- **reset override** to desktop values per element or section
- **per-breakpoint stack order** — reorder flex items on smaller breakpoints without changing desktop
- responsive edits write media queries or container queries to host CSS
- Theme Manager token picker integrated with Styles panel
- embed mode `node.style` breakpoint overrides — backlog unless requested

### Acceptance criteria

- grid/flex layout differs at mobile vs desktop breakpoint in Stage preview
- override state visible in Properties/Styles; reset restores desktop cascade
- token edit in Theme Manager updates all usages in CSS variables

---

## v1.0.0 — Stable API

**Status: planned**

**Priority: critical.** First stable semver for public adopters.

### Deliverables

- freeze **code-first public APIs** — `@viewfoundry/sync`, `@viewfoundry/board`, editor embed props, discover CLI
- freeze **embed-mode APIs** — `ViewDocument` schema `0.1`, `generateTsx`, existing editor JSON path (no removal)
- migration guide: JSON embed → code-first adoption
- RTD “production readiness” guide; security & embedding notes
- `1.0.0` git tag and npm publish policy documented in `specs/PACKAGE_API_SPEC.md`

### Acceptance criteria

- no breaking API changes without 2.0.0
- code-first flows documented on RTD: boards, styles, Add Elements, pages, interactions
- CI green; e2e covers code-first author flows (including Stage DnD bar) + embed mode regression suite

---

## v1.1.0 — Nested routes & layouts

**Status: planned** (post-1.0)

Shared parent layouts and nested route tree. See [POST_1_0.md](POST_1_0.md) and [ROUTING.md](ROUTING.md).

---

## v1.2.0 — Framework adapters

**Status: planned** (post-1.0)

Next.js App Router and optional Remix codegen/dev adapters. See [POST_1_0.md](POST_1_0.md).

---

## v1.3.0 — Async data & loaders

**Status: planned** (post-1.0)

Route/node loaders; binding loader results to props. See [POST_1_0.md](POST_1_0.md).

---

## v1.4.0 — Plugin API

**Status: planned** (post-1.0)

Formal extension points for inspector, palette, interactions, codegen. See [POST_1_0.md](POST_1_0.md).

---

## v1.6.0 — Existing project import

**Status: superseded by [v0.9.0](#v090---add-elements--discovery).** Component discovery and `viewfoundry import` moved earlier as part of the code-first pivot.

---

## Versioning notes

- **v0.1.x – v0.6.x** — JSON embed-mode foundation; shipped and frozen for embed API
- **v0.7+** — code-first milestones per [CODE_FIRST.md](CODE_FIRST.md)
- **v0.X.0** — minor releases add capabilities; embed `ViewDocument` schema `0.1` unchanged unless explicitly versioned
- **v1.0.0** — stable **code-first** public API; embed JSON API stable but secondary
- **v1.1+** — platform adapters, loaders, plugins ([POST_1_0.md](POST_1_0.md))
- **Embed backlog** — JSON-only slots, bindings, repeat, forms — post-1.0 if embed customers need them

**Status: exploratory** (post-1.0)

Comments, real-time co-editing, i18n, a11y panel, motion — evaluate after 1.0 adoption. See [POST_1_0.md](POST_1_0.md).

---

## v1.5.0+ — Collaboration & advanced
