# Roadmap & product direction

ViewFoundry **v0.6.0** (npm `0.5.0`–`0.6.0`) ships an **embed-mode** visual editor: register React components, edit a JSON `ViewDocument`, render with `@viewfoundry/react`, export TSX.

From **v0.7.0**, the primary path becomes **code-first**: visual edits write to your **TSX and CSS files**; the JSON document remains supported as **embed mode** for CMS-style hosts and this docs Studio.

Maintainer detail: [ROADMAP.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/ROADMAP.md), [CODE_FIRST.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/CODE_FIRST.md), [DND_AND_LAYOUT_RESEARCH.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/DND_AND_LAYOUT_RESEARCH.md).

## Two authoring modes

|                     | **Embed mode** (shipped)                 | **Code-first** (v0.7+)                  |
| ------------------- | ---------------------------------------- | --------------------------------------- |
| **Source of truth** | `ViewDocument` JSON                      | `.tsx` / CSS files in your repo         |
| **Best for**        | Browser Studio, CMS, persisted page JSON | Developer teams editing real code       |
| **Export**          | `generateTsx()` + import map             | Not required — edits are already code   |
| **Layout**          | `layout.grid` on JSON nodes              | **Stack** / **Grid** components in JSX  |
| **Styling**         | `node.style` tokens (v0.4)               | Styles panel on real stylesheets (v0.8) |

Both modes stay supported through **v1.0.0**. New features ship on the code-first path first.

## Editor UX direction

Panel and Stage patterns combine:

- **Codux** — boards, Stage, Elements, Properties, Styles, Add Elements, Theme Manager
- **Figma** — auto-layout semantics (Hug / Fill / Fixed), smart guides, component swap on drop
- **Wix Studio** — stacks/grids, parent/child selection, responsive cascade

ViewFoundry stays **embeddable** in your product (not a proprietary desktop IDE).

### Stage drag-and-drop quality bar (v0.7+)

Every drag on the Stage must provide:

1. Ghost preview following the cursor
2. Valid drop targets highlighted (dashed outline)
3. Blocked cursor + plain-language reason on invalid drops
4. Snap with modifier to disable
5. Brief settle animation on success
6. Elements tree synced with Stage
7. Escape cancels drag
8. Undo restores layout in one step

## Pre-1.0 milestones

| Version   | Theme                                                                   |
| --------- | ----------------------------------------------------------------------- |
| **v0.7**  | Code-first foundation, boards, sync, Stage DnD, Stack/Grid layout tools |
| **v0.8**  | Styles panel, Theme Manager, Hug/Fill/Fixed sizing                      |
| **v0.9**  | Add Elements panel, `viewfoundry import`, Alt+swap, project discovery   |
| **v0.10** | App pages, Sections, routing in source                                  |
| **v0.11** | Interactions as TSX handlers                                            |
| **v0.12** | Clipboard, saved blocks, multi-select drag                              |
| **v0.13** | Responsive preview, cascade/override UI                                 |
| **v1.0**  | Stable code-first + frozen embed APIs                                   |

## Planned packages (v0.7+)

| Package                 | Role                                            |
| ----------------------- | ----------------------------------------------- |
| `@viewfoundry/sync`     | TSX/CSS parse, selection map, safe patches      |
| `@viewfoundry/board`    | `createBoard()`, `.board.tsx` fixtures          |
| `@viewfoundry/discover` | Scan project exports; bootstrap registry (v0.9) |

Existing packages (`core`, `editor`, `react`, `schema`, `codegen`, `vite`, `cli`) evolve; embed APIs are not removed in v1.0.

## What we are not building

- Proprietary desktop IDE (contrast: Codux)
- Wix Classic **absolute X/Y** as the default layout model
- Hosted platform lock-in
- JSON-only features (slots, bindings, repeat in document JSON) unless embed customers need them post-1.0

## Using ViewFoundry today (v0.5 / v0.6)

Until code-first packages ship:

1. [Getting started](getting-started.md) — embed JSON editor
2. [Integrate into an existing app](integrate-existing-app.md) — manual `defineComponent` wiring
3. [Try the Studio](studio.md) — embed-mode demo in the browser
4. [Production patterns](production-patterns.md) — runtime-only, CI validate, persistence

When **v0.9** lands, `viewfoundry import` will reduce manual registration for existing React projects.

## Post-1.0

Nested routes, Next.js adapters, data loaders, plugin API — see [POST_1_0.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/POST_1_0.md).
