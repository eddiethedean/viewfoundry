# Roadmap

Releases are versioned **v0.X** milestones. Each version ships a coherent slice of capability. Earlier internal “Phase N” planning maps to these releases as noted below.

## Release overview

| Version                                  | Status       | Theme                                          |
| ---------------------------------------- | ------------ | ---------------------------------------------- |
| [v0.1.0](#v010---sdk-foundation)         | **Released** | Core SDK, basic editor, codegen, example app   |
| [v0.2.0](#v020---edit--live-studio)      | **Released** | Single-window Edit / Live toggle               |
| [v0.3.0](#v030---grid-layout--dragdrop)  | **Released** | Grid system and satisfying layout drag/drop    |
| [v0.4.0](#v040---style-editor)           | **Released** | Style Editor sub-mode and `node.style`         |
| [v0.5.0](#v050---cli--examples)          | Planned      | `init`, Vite plugin, additional examples       |
| [v0.6.0](#v060---documentation-site)     | **Released** | Read the Docs site with embedded studio        |
| [v0.7.0](#v070---lessonkit-integration)  | Planned      | LessonKit adapter and flagship integration     |
| [v0.8.0](#v080---interactions--triggers) | Planned      | Component interactions, triggers, and actions  |
| [v0.9.0](#v090---routing--multi-page)    | Planned      | Multi-route sites, Pages panel, URL navigation |

### Pre-1.0 (v0.10 – v0.15)

| Version                                            | Status  | Theme                                           |
| -------------------------------------------------- | ------- | ----------------------------------------------- |
| [v0.10.0](#v0100---slots--composition)             | Planned | Named slots & compound components               |
| [v0.11.0](#v0110---bindings-variables--conditions) | Planned | Data bindings, variables, visibility conditions |
| [v0.12.0](#v0120---repeat--lists)                  | Planned | List/repeat templates                           |
| [v0.13.0](#v0130---clipboard--saved-blocks)        | Planned | Copy/paste subtrees & saved block library       |
| [v0.14.0](#v0140---forms)                          | Planned | Form patterns, validation, submit flows         |
| [v0.15.0](#v0150---responsive--design-tokens)      | Planned | Breakpoint overrides & theme tokens             |
| [v1.0.0](#v100---stable-api)                       | Planned | Stable public API & document contract           |

### Post-1.0

| Version                                   | Status      | Theme                             |
| ----------------------------------------- | ----------- | --------------------------------- |
| [v1.1.0](#v110---nested-routes--layouts)  | Planned     | Nested routes & shared layouts    |
| [v1.2.0](#v120---framework-adapters)      | Planned     | Next.js and other router adapters |
| [v1.3.0](#v130---async-data--loaders)     | Planned     | Route/node data loaders           |
| [v1.4.0](#v140---plugin-api)              | Planned     | Extension & plugin API            |
| [v1.6.0](#v160---existing-project-import) | Planned     | Load existing React projects & components |
| [v1.5.0+](#v150--collaboration--advanced) | Exploratory | Collaboration, i18n, a11y, motion |

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
- no declarative interactions between components → **v0.8.0**
- no multi-route / multi-page sites → **v0.9.0**
- no named slots → **v0.10.0**
- no data bindings or variables → **v0.11.0**
- manual `defineComponent` registration for every component → **v1.6.0** (existing project import)

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

**Status: planned**

### Deliverables

- `viewfoundry init` — scaffold a working project
- `@viewfoundry/vite` — real dev-server integration (currently a no-op stub)
- `examples/dashboard-builder`
- `examples/landing-page` — single-page first; multi-route in **v0.9.0** (see [ROUTING.md](ROUTING.md))
- integration guides in repo docs — including **manual** wiring for existing React apps today
- **planned follow-up:** automated load/discovery of components from existing projects → **v1.6.0**

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

## v0.8.0 — Interactions & triggers

**Status: planned**

**Priority: high.** Declarative wiring between components — triggers (events) and actions (effects) — without functions in document JSON.

See [INTERACTIONS.md](INTERACTIONS.md) for the full model.

### Deliverables

- **`interactions` on `ViewDocument`** — trigger → action lists with stable node id references
- **registry metadata** — `events` and `actions` on `ComponentDefinition`; built-in `click`, `change`, `setProp`, `toggleVisibility`, …
- **core commands** — `addInteraction`, `updateInteraction`, `removeInteraction` with validation and undo/redo
- **runtime interpreter** in `@viewfoundry/react` — execute interactions in Live mode
- **Interactions editor sub-mode** — list, create, and edit wiring in the studio (toolbar: Component | Style | Interactions)
- **codegen** — emit runtime helper or handler module; warnings for unsupported actions
- **example** — button click updates another component’s prop in `examples/basic-react`

### Acceptance criteria

- user can define “when Button A is clicked, set Heading B text” entirely in the editor
- interaction JSON round-trips through save/load and runs in Live mode
- invalid targets or unknown events surface validation errors in the editor
- interaction edits undo/redo without corrupting structure or layout
- codegen produces runnable output or explicit warnings

### Known gaps (addressed in later releases)

- visual canvas wiring overlay → later within v0.8.x
- continuous data **bindings** → **v0.11.0**
- document/site **variables** and **conditions** → **v0.11.0**
- full **routing** and URL `navigate` → **v0.9.0**

---

## v0.9.0 — Routing & multi-page

**Status: planned**

**Priority: high.** Multiple routes per app — each with its own `ViewDocument` — plus editor Pages panel and runtime navigation.

See [ROUTING.md](ROUTING.md) for the full model.

### Deliverables

- **`ViewSite` / `ViewRoute`** — site container with path, label, and document per route
- **Pages panel** in `@viewfoundry/editor` — add, switch, duplicate, delete routes
- **`ViewFoundrySiteProvider` + `ViewRouter`** in `@viewfoundry/react` — match path, render active page
- **`navigate` integration** — v0.8 interaction action drives site navigation; optional `NavLink` + `routeRef` field
- **site commands** — `addRoute`, `updateRoute`, `removeRoute`, `duplicateRoute`
- **codegen** — React Router (or adapter) route table + per-page components
- **`@viewfoundry/vite`** — SPA fallback for dev preview of client routes
- **example** — multi-page `examples/landing-page` (extends v0.5.0 scaffold)

### Acceptance criteria

- user can author Home and About as separate pages and switch between them in the editor
- Live mode navigates between routes via interaction or link component
- path patterns with params validate and resolve at runtime
- single-document apps (no site config) continue to work unchanged
- site + pages export to a runnable multi-route React app

### Known gaps (addressed in later releases)

- nested layouts / shared parent routes → **v1.1.0**
- Next.js / file-based router adapters → **v1.2.0**
- route-level data loaders → **v1.3.0**

---

## v0.10.0 — Slots & composition

**Status: planned**

**Priority: high.** Named slots for real React compound components.

See [SLOTS.md](SLOTS.md).

### Deliverables

- `slots` on `ViewNode`; slot metadata on `ComponentDefinition`
- slot-aware insert/reparent commands and validation
- canvas drop targets and layers grouping per slot
- codegen for slot props / subcomponents

### Acceptance criteria

- user can place content into Card `header` and `footer` slots independently
- invalid slot or child type is rejected with clear errors
- exported TSX matches the host component’s slot API

---

## v0.11.0 — Bindings, variables & conditions

**Status: planned**

**Priority: high.** Continuous data flow and declarative visibility.

See [DATA_BINDING.md](DATA_BINDING.md).

### Deliverables

- **bindings** — prop ← variable, route param, node prop, literal
- **variables** on document/site for shared state
- **conditions** on nodes for show/hide
- runtime resolver in `@viewfoundry/react`; binding/variable commands
- inspector UI: bind prop, edit variables, simple condition builder

### Acceptance criteria

- input bound to variable updates heading in Live mode
- node hidden when condition is false; visible when true
- route param binding works on parameterized paths (with v0.9)

---

## v0.12.0 — Repeat & lists

**Status: planned**

**Priority: high.** Template subtrees rendered per list item.

See [REPEAT.md](REPEAT.md).

### Deliverables

- `repeat` on `ViewNode` with static items array (MVP)
- optional bind `repeat.source` to variable (with v0.11)
- runtime list rendering; codegen `.map()` emission
- editor: items editor + repeat preview

### Acceptance criteria

- user builds a 3-item nav from one template row
- list round-trips JSON and renders in Live mode

---

## v0.13.0 — Clipboard & saved blocks

**Status: planned**

**Priority: medium.** Author productivity.

See [CLIPBOARD_AND_BLOCKS.md](CLIPBOARD_AND_BLOCKS.md).

### Deliverables

- copy/paste subtree (keyboard + toolbar); new ids on paste
- cross-page paste within a site
- **saved blocks** library on site or host; palette “Blocks” category
- commands integrated with undo/redo

### Acceptance criteria

- copy Card subtree, paste into Grid cell on another page
- save hero section as block and insert twice with independent edits

---

## v0.14.0 — Forms

**Status: planned**

**Priority: medium.** Form UIs over registered inputs.

See [FORMS.md](FORMS.md).

### Deliverables

- form container conventions in registry
- field ↔ variable bindings; validation metadata on props
- submit trigger + interaction chain (validate → actions)
- inspector validation editor; basic Live validation

### Acceptance criteria

- user builds contact form visually; submit updates state or navigates
- required field blocks submit with visible error

---

## v0.15.0 — Responsive & design tokens

**Status: planned**

**Priority: medium.** Breakpoints and theme-aware styling.

See [RESPONSIVE.md](RESPONSIVE.md).

### Deliverables

- responsive `layout` / `style` overrides per breakpoint
- editor breakpoint switcher; host breakpoint config
- token registry; token picker in Style Editor
- codegen resolves tokens to CSS variables or theme paths

### Acceptance criteria

- grid columns differ mobile vs desktop in Live preview
- style uses `color.primary` token from host theme

---

## v1.0.0 — Stable API

**Status: planned**

**Priority: critical.** First stable semver for public adopters.

### Deliverables

- freeze **document schema** `0.1` + optional fields shipped through v0.15
- freeze **public package APIs** documented in `specs/PACKAGE_API_SPEC.md`
- migration guides for any breaking changes from late v0.x
- RTD “production readiness” guide; security & embedding notes
- `1.0.0` git tag and npm publish policy

### Acceptance criteria

- no breaking API changes without 2.0.0
- all v0.10–v0.15 features documented on RTD
- CI green; e2e covers primary author flows (layout, style, interactions, routing, slots)

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

**Status: planned** (post-1.0)

**Priority: high for adoption.** Today every component must be registered manually with `defineComponent`. This release adds workflows to **load an existing React project** and populate the editor palette from components already in that codebase.

### Deliverables

- **`viewfoundry import`** (or equivalent CLI) — point at an existing Vite/React (or adapter-supported) repo
- **component discovery** — configurable scan paths (globs) for exported React components
- **registry bootstrap** — generate starter `ComponentDefinition` entries and codegen **import maps** from project structure
- **optional TypeScript inference** — stub prop schemas from component types where available; developer review before publish
- **gradual adoption** — opt-in subset of components; explicit registration remains the safe default
- integration docs: manual wiring (**v0.5.0**) vs automated import (**v1.6.0**)

### Acceptance criteria

- developer connects an existing app and gets a working palette without hand-writing every `defineComponent`
- generated import paths match the host project layout; TSX export resolves correctly
- undiscovered or unreviewed components do not appear in the palette until confirmed
- LessonKit and other adapters can reuse the same discovery hooks for their vocabularies

See [COMPONENT_REGISTRY.md](COMPONENT_REGISTRY.md) and [UX_AND_DX.md](UX_AND_DX.md).

---

## v1.5.0+ — Collaboration & advanced

**Status: exploratory** (post-1.0)

Comments, real-time co-editing, i18n, a11y panel, motion — evaluate after 1.0 adoption. See [POST_1_0.md](POST_1_0.md).

---

## Versioning notes

- **v0.1.x** — patch fixes and non-breaking SDK improvements on the foundation release
- **v0.X.0** — minor releases add capabilities; document model may gain optional fields (`layout`, `style`, `slots`, …) with backward-compatible defaults
- **v0.10 – v0.15** — pre-1.0 composition, data, productivity, and polish milestones (see table above)
- **v1.0.0** — stable public API and document contract; breaking changes require **v2.0.0**
- **v1.1+** — platform adapters, loaders, plugins, existing project import, and exploratory features ([POST_1_0.md](POST_1_0.md))
