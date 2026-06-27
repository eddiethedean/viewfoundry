# UX & DX standards

ViewFoundry serves **two audiences** on every feature:

| Audience            | Who                                                    | Success looks like                                                                       |
| ------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| **Studio user**     | Non-technical author, marketer, instructional designer | Builds and previews UIs without reading JSON or React; mistakes are recoverable          |
| **React developer** | Integrator embedding ViewFoundry in a product          | Registers or discovers real components; embed in product; commit visual edits as TSX/CSS |

Every release in [ROADMAP.md](ROADMAP.md) must satisfy the **global bars** below plus the **per-feature** rows in this document. From **v0.7**, code-first features take priority; embed JSON features are maintained but not extended unless listed in the embed backlog. See [CODE_FIRST.md](CODE_FIRST.md) and [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

---

## Global DnD quality bar (v0.7+)

Inspired by Figma and Wix; required for every author-facing drag on the **Stage**. Full rationale in [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

| #   | Requirement                                                                             |
| --- | --------------------------------------------------------------------------------------- |
| 1   | **Ghost** follows cursor (reduced opacity)                                              |
| 2   | **Valid targets highlight** before release; active target uses dashed outline           |
| 3   | **Invalid target** — blocked cursor + plain-language reason (component labels, not ids) |
| 4   | **Snap** to cells/edges; modifier key **disables snap** for precision                   |
| 5   | **Settle animation** on successful drop (~150–200ms)                                    |
| 6   | **Elements tree** order syncs with Stage immediately                                    |
| 7   | **Escape** cancels drag and restores placeholder                                        |
| 8   | **Undo** restores prior layout in one step                                              |

Embed-mode grid DnD (v0.3) should meet this bar where applicable; code-first JSX reparenting must meet all eight from **v0.7.0**.

---

## Global bars (all features)

### Studio user (UI)

1. **Plain language** — Panel titles, errors, and empty states avoid jargon (`node id`, `payload`, `registry`, `AST`). Use component **labels** from registration metadata.
2. **Safe by default** — Authors cannot insert invalid children, break the grid, or wire impossible interactions without a clear blocked state and explanation.
3. **Forgiving** — Undo/redo for structural edits; Escape clears selection; destructive actions confirm when they remove substantial work.
4. **WYSIWYG Live** — Live mode matches what authors expect from the published app for layout, props, interactions, and routing (within registered component fidelity).
5. **Progressive disclosure** — Component editing first; Style, Interactions, Pages, and advanced binding UIs live in sub-modes or drawers — not one overwhelming inspector.
6. **Discoverability** — Add Elements search, Elements tree, and drop targets on Stage make the next action obvious; empty board shows a short hint.
7. **Consistent chrome** — Edit / Live toggle always visible; sub-mode tabs use the same order everywhere (Component → Style → Interactions); panel names match [EDITOR_SPEC.md](EDITOR_SPEC.md) (Stage, Elements, Properties, Styles).
8. **Accessible basics** — Toolbar and palette operable by keyboard; inspector fields have labels; focus rings on interactive controls (WCAG-oriented, not a full audit).

### React developer (DX)

1. **Real components** — No parallel component system; edits land in the same React components and CSS files used in production.
2. **Copy-pasteable docs** — Getting started and examples run without undefined symbols; dual CSS imports and version pins documented.
3. **Typed, predictable APIs** — `CommandResult` with `ok` / `error`; file-edit results cite file path and range; no silent mutation.
4. **Lockstep versions** — All `@viewfoundry/*` packages share semver; peer dependency story is one line in docs.
5. **Committable output** — Code-first diffs read like hand-written TSX/CSS; embed codegen still produces shippable TSX with warnings.
6. **Embed flexibility** — Code-first (project files) and embed (controlled `document` + `onChange`) documented side by side.
7. **Validation before save** — embed: `validateDocument` / CLI `validate`; code-first: patch validation with actionable file/line messages.
8. **Testability** — Public behavior covered by unit tests; primary author flows covered by Playwright e2e (both modes where applicable).

---

## Per-feature requirements

### Shipped (v0.1 – v0.3)

| Feature                | Studio user                                                                     | React developer                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Registry & palette** | Components grouped by category; search filters by name; click or drag to insert | `defineComponent` + prop builders; `allowedChildren` prevents author mistakes                    |
| **Inspector**          | Human-readable field labels from schema; live canvas update on change           | Field builders map 1:1 to prop types; defaults in schema                                         |
| **Edit / Live**        | One window; obvious toggle; Live hides chrome; buttons stay clickable           | `onStudioModeChange`; same document reference across modes                                       |
| **Grid & DnD**         | Visible grid cells, drag ghost, snap; layers show grid position (`r1c1`)        | `layout.grid` in JSON; codegen emits `gridColumn` / `gridRow`                                    |
| **Undo / redo**        | Toolbar buttons; disabled when unavailable                                      | Works in uncontrolled / store-driven embeds; document controlled-mode history called out in docs |
| **Export TSX**         | “Export TSX” opens readable preview                                             | `generateTsx` + `importMap`; warnings array                                                      |
| **Docs & Studio**      | Try without clone via RTD Studio                                                | `pnpm docs:build`; RTD badge; PACKAGE_API_SPEC for contract                                      |

**Gaps to close in upcoming work:** canvas click selection vs grid overlay (prefer layers panel); keyboard shortcuts listed in UI help.

### v0.4 — Style Editor **(shipped)**

| Studio user                                                                               | React developer                                                                |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Sub-mode tab **Style**; only visual props (spacing, color, type) — not component identity | `node.style` separate from `props`; tokens optional via host preset            |
| Canvas updates immediately; token picker shows friendly names (“Primary”, “Spacing md”)   | Codegen maps style to inline or CSS variables; document token registration API |
| Authors never edit raw CSS unless “Advanced” expanded                                     | Style commands participate in undo like structure edits                        |

### v0.5 — CLI & examples **(shipped)**

| Studio user                                                      | React developer                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Examples demonstrate author-realistic pages (dashboard, landing) | `viewfoundry init` produces runnable project in &lt;5 commands             |
| —                                                                | `vite` dev server hot-reloads document JSON; clear error when JSON invalid |

### v0.6 — Documentation site **(shipped)**

| Studio user                                                                                              | React developer                                                            |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Try ViewFoundry without clone via [RTD Studio](https://viewfoundry.readthedocs.io/en/latest/studio.html) | `pnpm docs:build` compiles prose + embedded studio; RTD badge in README    |
| Edit/Live, export TSX, and Show JSON in the browser embed                                                | Package API spec published on RTD; e2e covers embedded + standalone studio |

### v0.7 — Code-first foundation & boards

| Studio user                                                  | React developer                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| **Board** tab; Stage with viewport sizing                    | `@viewfoundry/board` + `.board.tsx`; `@viewfoundry/sync`   |
| Drag shows **ghost**, **dashed drop zone**, alignment guides | Reparent/reorder writes JSX; Stack vs Grid rules enforced  |
| **Parent-first / child-first** canvas click mode             | Selection map to source; obscured nodes from Elements tree |
| **Elements** tree; multi-select; drag-reorder                | File-level undo; HMR sync with external IDE                |
| Invalid drop explains _why_ in plain language                | No absolute X/Y positioning in code-first path             |

### v0.8 — Styles panel & Theme Manager

| Studio user                                            | React developer                       |
| ------------------------------------------------------ | ------------------------------------- |
| **Style** sub-mode; Hug / Fill / Fixed sizing labels   | Patches flex/grid CSS and stylesheets |
| Gap/padding **scrub handles** on Stage where supported | Class picker tied to source files     |
| **Theme Manager** + computed styles (read-only)        | CSS variables in host stylesheet      |

### v0.9 — Add Elements & discovery

| Studio user                                                     | React developer                               |
| --------------------------------------------------------------- | --------------------------------------------- |
| **Add Elements**: Stacks, Grids, Sections, components, blocks   | `@viewfoundry/discover`; `viewfoundry import` |
| **Alt+drop** swaps selected component                           | Schema-valid swap only                        |
| **Quick insert** shortcut; “Stack these?” overlap hint          | Gradual adoption for discovered components    |
| Drag insert meets [global DnD bar](#global-dnd-quality-bar-v07) | Correct imports in TSX                        |

### v0.10 — App pages & routing

| Studio user                                   | React developer         |
| --------------------------------------------- | ----------------------- |
| **Section** regions on pages; **Pages** panel | Route/page TSX editing  |
| Copy section to another page                  | Import rewrite on paste |
| Live navigates between pages                  | SPA vite fallback       |

### v0.11 — Interactions

| Studio user                           | React developer               |
| ------------------------------------- | ----------------------------- |
| **Interactions** sub-mode sentence UI | TSX handlers, not JSON wiring |
| Pick targets from Elements tree       | Idiomatic React               |

### v0.12 — Clipboard & blocks

| Studio user                                  | React developer          |
| -------------------------------------------- | ------------------------ |
| Cmd/Ctrl+C/V; **multi-select drag** on Stage | JSX + imports            |
| **Blocks** in Add Elements; drag to insert   | Project library snippets |

### v0.13 — Responsive & tokens

| Studio user                                           | React developer            |
| ----------------------------------------------------- | -------------------------- |
| Breakpoint switcher; **inherited vs override** badges | Media queries in host CSS  |
| **Reset override** to desktop                         | Per-breakpoint stack order |
| Token picker in Styles                                | CSS variables              |

### v1.0 — Stable API

| Studio user                                               | React developer                            |
| --------------------------------------------------------- | ------------------------------------------ |
| RTD Author + Integrator guides cover code-first and embed | Semver policy; migration JSON → code-first |
| Embedded studio matches product behavior                  | PACKAGE_API_SPEC frozen; e2e both modes    |

### Embed mode only (shipped v0.1–v0.4, maintained through v1.0)

| Feature                                      | Notes                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| JSON grid, `node.style`, palette, export TSX | Unchanged; regression-tested; not extended with new JSON-only features pre-1.0 |

### Post-1.0 (v1.1+)

| Area                   | Studio user                                          | React developer                                      |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| **Nested layouts**     | Route tree matches mental model of “section layouts” | Nested route codegen documented                      |
| **Framework adapters** | —                                                    | Next.js README with RSC boundaries explicit          |
| **Loaders**            | Loading skeletons in Live preview                    | Loader registration; binding loader fields to props  |
| **Plugins**            | Custom panels use same chrome/labels conventions     | Plugin API typed; examples in repo                   |
| **Existing projects**  | Add Elements shows familiar component names          | `viewfoundry import` in **v0.9.0** (moved from v1.6) |
| **Collaboration**      | Presence cursors, not raw locking jargon             | —                                                    |

---

## Review checklist (PR / release)

Before marking a milestone done:

- [ ] Stage DnD meets [global DnD bar](#global-dnd-quality-bar-v07) when author flows changed
- [ ] Studio: empty state, error state, and success path manually tested in `examples/basic-react` or docs Studio
- [ ] Studio: no new raw-id-only UI without a human label
- [ ] Developer: RTD or spec updated with embed + codegen snippet
- [ ] Developer: TypeScript types exported from package entry points
- [ ] Tests: unit test for core behavior; e2e if author-facing flow changed
- [ ] [FAQ](../apps/docs/faq.md) / [Troubleshooting](../apps/docs/troubleshooting.md) updated if support burden expected

---

## See also

- [CODE_FIRST.md](CODE_FIRST.md) — code-first strategy
- [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md) — Figma/Wix DnD and layout patterns
- [EDITOR_SPEC.md](EDITOR_SPEC.md) — layout and modes
- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — target users
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) — behavioral and UX acceptance tests
- [ROADMAP.md](ROADMAP.md) — release milestones
