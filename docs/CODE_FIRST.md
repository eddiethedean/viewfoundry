# Code-first editing strategy

**Status:** Planning — target from **v0.7.0** onward  
**Supersedes:** JSON-as-source-of-truth for new features (see [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md))

## Decision

ViewFoundry will pivot from a **JSON document middle layer** to **direct React source editing** as the primary authoring model. Visual changes write to real `.tsx` / `.css` (or CSS module) files; code edits reflect instantly in the studio.

The v0.1–v0.6 **ViewDocument** stack remains supported as **embed mode** — a serializable JSON path for CMS-style products and browser-only Studio. New capabilities ship on the code-first path first; JSON parity follows only where embed customers need it.

## Why

| JSON middle layer (v0.1–v0.6)                  | Code-first (v0.7+)                                          |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Extra round-trip: edit → JSON → codegen → ship | What you edit is what you commit                            |
| `node.style` tokens ≠ host CSS conventions     | Styles panel edits real stylesheets and variables           |
| Manual `defineComponent` for every component   | Discovery from existing project exports                     |
| Grid/layout as document fields                 | Layout expressed as JSX structure + CSS Grid/Flex in source |
| Interactions as JSON wiring                    | Handlers and hooks in TSX; optional declarative helpers     |

**Codux** validated this market: React teams want visual editing without a parallel DSL. ViewFoundry keeps the differentiator — **embeddable npm packages** inside your product, not a proprietary desktop IDE.

## Reference: Codux patterns we adopt

These inform editor UX and release ordering (see [EDITOR_SPEC.md](EDITOR_SPEC.md), [UX_AND_DX.md](UX_AND_DX.md), [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md)):

| Codux concept                                    | ViewFoundry adaptation                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Boards** (`.board.tsx` isolation)              | `@viewfoundry/board` — `createBoard()` fixtures for component-level editing    |
| **Stage**                                        | Canvas with viewport sizing and responsive preview                             |
| **Elements panel**                               | DOM/component tree; multi-select; grid position hints                          |
| **Properties panel**                             | Auto-generated from prop types + optional schema                               |
| **Styles panel**                                 | Visual CSS controllers writing to class/CSS module files                       |
| **Computed styles**                              | Read-only cascade view; click-through to Styles panel                          |
| **Add Elements panel**                           | Categorized insert: HTML, layouts, project components, saved variants          |
| **Theme Manager**                                | Global CSS variables and font presets                                          |
| **Board settings**                               | Viewport, background, “show in Add Elements”                                   |
| **Component \| Style \| Interactions** sub-modes | Same progressive disclosure under Edit                                         |
| **Open in browser**                              | DevTools-friendly preview tab for active board/page                            |
| **Bi-directional sync**                          | Vite HMR + AST patch layer; external IDE stays in sync                         |
| **Stack / Grid layout tools**                    | Flex/grid containers; Figma auto layout + Wix Studio stacks (not absolute X/Y) |
| **Stage DnD feedback**                           | Smart guides, ghost, dashed drop zones, snap (Figma/Wix)                       |

## What we do not copy

- **Proprietary desktop app** — ViewFoundry stays embeddable (web component / React shell).
- **Wix Headless lock-in** — no bundled CMS/commerce; host brings backend.
- **Remix-only routing** — framework adapters (React Router first) stay optional packages.
- **Closed IDE** — core sync and board helpers remain open MIT packages.

## Architecture (target)

```txt
Existing React project (TSX, CSS, Vite)
        ↓
Component discovery + optional defineComponent enrichment
        ↓
@viewfoundry/sync — parse / patch AST, map DOM selection ↔ source locations
        ↓
@viewfoundry/board — isolated render fixtures (.board.tsx)
        ↓
@viewfoundry/editor — Stage, panels, commands → file writes
        ↓
Git / host persistence (not ViewFoundry-owned storage)
```

**Embed mode (legacy path):**

```txt
ViewDocument JSON → ViewRenderer / generateTsx (unchanged for v0.1–v0.6 adopters)
```

## New packages (planned)

| Package                 | Role                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| `@viewfoundry/board`    | `createBoard`, board types, test helpers (Codux `@wixc3/react-board` analogue) |
| `@viewfoundry/sync`     | TS/JSX/CSS parse, selection maps, safe patches, undo snapshots on files        |
| `@viewfoundry/discover` | Scan project exports; bootstrap registry stubs and import maps                 |

Existing packages evolve:

- `@viewfoundry/core` — file-edit commands, board types; ViewDocument types frozen for embed mode
- `@viewfoundry/editor` — Codux-inspired panel layout; board + page tabs
- `@viewfoundry/codegen` — optional for embed mode; not required when editing source directly
- `@viewfoundry/vite` — board HMR, sync overlay, project root detection
- `@viewfoundry/cli` — `viewfoundry init` adds boards; `viewfoundry import` opens existing repos

## Migration & compatibility

1. **v0.7.0** — document dual mode in RTD; no breaking removal of JSON APIs.
2. **Examples** — `basic-react` gains a code-first path; JSON demo retained until v1.0 docs sunset.
3. **v1.0.0** — stable **code-first public API**; ViewDocument embed API stable but secondary.

## Success criteria (code-first)

- Developer opens an existing Vite + React + TS project and edits a component visually; diff shows only expected TSX/CSS changes.
- Board isolation: component renders with mocked props/providers; app route unchanged.
- Style edit in Styles panel updates the correct CSS rule or module class.
- Undo/redo restores prior file contents across structure and style edits.
- Embed mode: existing JSON + `ViewFoundryEditor` + `generateTsx` flows still pass CI.

## See also

- [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md) — Figma/Wix drag-and-drop and layout patterns
- [ROADMAP.md](ROADMAP.md) — release milestones from v0.7
- [ARCHITECTURE.md](ARCHITECTURE.md) — updated principles and data flow
- [EDITOR_SPEC.md](EDITOR_SPEC.md) — panel layout and Codux-inspired UX
- [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md) — embed-mode document schema (frozen)
