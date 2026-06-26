# UX & DX standards

ViewFoundry serves **two audiences** on every feature:

| Audience            | Who                                                    | Success looks like                                                                          |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Studio user**     | Non-technical author, marketer, instructional designer | Builds and previews UIs without reading JSON or React; mistakes are recoverable             |
| **React developer** | Integrator embedding ViewFoundry in a product          | Registers real components once; embed, persist, and export with predictable TypeScript APIs |

Every release in [ROADMAP.md](ROADMAP.md) must satisfy the **global bars** below plus the **per-feature** rows in this document. Implementation specs (INTERACTIONS, ROUTING, etc.) link here for acceptance review.

---

## Global bars (all features)

### Studio user (UI)

1. **Plain language** — Panel titles, errors, and empty states avoid jargon (`node id`, `payload`, `registry`). Use component **labels** from registration metadata.
2. **Safe by default** — Authors cannot insert invalid children, break the grid, or wire impossible interactions without a clear blocked state and explanation.
3. **Forgiving** — Undo/redo for structural edits; Escape clears selection; destructive actions confirm when they remove substantial work.
4. **WYSIWYG Live** — Live mode matches what authors expect from the published app for layout, props, interactions, and routing (within registered component fidelity).
5. **Progressive disclosure** — Component editing first; Style, Interactions, Pages, and advanced binding UIs live in sub-modes or drawers — not one overwhelming inspector.
6. **Discoverability** — Palette search, layers tree, and grid drop targets make the next action obvious; empty canvas shows a short hint.
7. **Consistent chrome** — Edit / Live toggle always visible; sub-mode tabs use the same order everywhere (Component → Style → Interactions).
8. **Accessible basics** — Toolbar and palette operable by keyboard; inspector fields have labels; focus rings on interactive controls (WCAG-oriented, not a full audit).

### React developer (DX)

1. **Real components** — No parallel component system; `defineComponent(YourButton, …)` uses the same React component as production.
2. **Copy-pasteable docs** — Getting started and examples run without undefined symbols; dual CSS imports and version pins documented.
3. **Typed, predictable APIs** — `CommandResult` with `ok` / `error`; embed props documented; no silent document mutation.
4. **Lockstep versions** — All `@viewfoundry/*` packages share semver; peer dependency story is one line in docs.
5. **Codegen you would ship** — Generated TSX reads like hand-written code; warnings explain omissions; import maps are explicit.
6. **Embed flexibility** — Controlled (`document` + `onChange`) and uncontrolled patterns documented, including known limitations (e.g. history when fully controlled — document workarounds).
7. **Validation before save** — `validateDocument` / CLI `validate` give actionable paths (node id, prop key, rule id).
8. **Testability** — Public behavior covered by unit tests; primary author flows covered by Playwright e2e.

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

### v0.7 — LessonKit

| Studio user                                                                  | React developer                                                             |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Lesson authors use familiar block names; adapter preserves lesson vocabulary | Adapter package maps blocks ↔ registry without forking core                 |
| —                                                                            | LessonKit types stay in adapter; ViewFoundry APIs unchanged for other hosts |

### v0.8 — Interactions

| Studio user                                                                                 | React developer                                                        |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Interactions** sub-mode: “When [Button] is clicked → set [Heading] text to …” sentence UI | `interactions[]` on document; registry `events` / `actions` metadata   |
| Pick source and target from layers or canvas list — not raw ids                             | `addInteraction` commands; validation errors cite node labels          |
| Preview behavior in **Live** only; Edit mode does not fire triggers accidentally            | Runtime interpreter in `@viewfoundry/react`; opt-out for custom shells |
| Disabled interaction toggle with label                                                      | Codegen emits handler module or documents runtime helper               |

### v0.9 — Routing

| Studio user                                                         | React developer                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Pages** panel: “Home”, “About” — paths shown as secondary detail  | `ViewSite` / `ViewRoute` types; single-doc apps still work           |
| Switch page without losing Edit/Live mode; preview any page in Live | `ViewFoundrySiteProvider` + `ViewRouter`; `routeRef` field for links |
| `navigate` interaction uses page names, not URL strings only        | React Router codegen adapter; path params via `useRouteParams()`     |

### v0.10 — Slots

| Studio user                                                                    | React developer                                                 |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Slot regions labeled on canvas (“Header”, “Footer”); drop only into valid slot | `slots` on `ComponentDefinition`; insert commands take `slotId` |
| Layers indent by slot                                                          | Codegen matches host slot API (props vs subcomponents)          |

### v0.11 — Bindings & variables

| Studio user                                               | React developer                                              |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| “Bind to…” on prop rows; variable sheet in plain language | `BindingSource` types; variables on document/site meta       |
| “Show when …” rule builder (no code)                      | Conditions validated; runtime resolver testable in isolation |
| Hidden nodes visually distinct in Edit mode               | Binding errors name source and target                        |

### v0.12 — Repeat

| Studio user                                               | React developer                                          |
| --------------------------------------------------------- | -------------------------------------------------------- |
| “Repeat for each item” with list editor (add/remove rows) | `repeat` on node; static array MVP then variable binding |
| Preview shows 2–3 sample items                            | Codegen `.map()` with stable keys                        |

### v0.13 — Clipboard & blocks

| Studio user                                                    | React developer                                        |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| Cmd/Ctrl+C/V; “Saved blocks” in palette with thumbnails/labels | Clipboard JSON schema versioned; paste regenerates ids |
| Insert block → editable copy, not locked instance              | Host can supply block library via API                  |

### v0.14 — Forms

| Studio user                                               | React developer                                 |
| --------------------------------------------------------- | ----------------------------------------------- |
| Form fields grouped; inline validation messages on submit | Conventions doc; variables for field values     |
| Submit success/error feedback in Live                     | `submit` trigger + interaction chain documented |

### v0.15 — Responsive & tokens

| Studio user                                                          | React developer                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Breakpoint switcher (“Mobile / Desktop”) with obvious override state | Host `breakpoints` config; responsive fields on layout/style |
| Token labels in style picker                                         | Token registry API; codegen → CSS variables                  |

### v1.0 — Stable API

| Studio user                                        | React developer                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| RTD “Author guide” and “Integrator guide” complete | Semver policy; migration guides; no breaking changes without 2.0 |
| Embedded studio matches product behavior           | PACKAGE_API_SPEC frozen; e2e covers critical paths               |

### Post-1.0 (v1.1+)

| Area                   | Studio user                                          | React developer                                      |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| **Nested layouts**     | Route tree matches mental model of “section layouts” | Nested route codegen documented                      |
| **Framework adapters** | —                                                    | Next.js README with RSC boundaries explicit          |
| **Loaders**            | Loading skeletons in Live preview                    | Loader registration; binding loader fields to props  |
| **Plugins**            | Custom panels use same chrome/labels conventions     | Plugin API typed; examples in repo                   |
| **Existing projects**  | Palette shows familiar component names from host app | `viewfoundry import`; scan paths; registry bootstrap |
| **Collaboration**      | Presence cursors, not raw locking jargon             | —                                                    |

---

## Review checklist (PR / release)

Before marking a milestone done:

- [ ] Studio: empty state, error state, and success path manually tested in `examples/basic-react` or docs Studio
- [ ] Studio: no new raw-id-only UI without a human label
- [ ] Developer: RTD or spec updated with embed + codegen snippet
- [ ] Developer: TypeScript types exported from package entry points
- [ ] Tests: unit test for core behavior; e2e if author-facing flow changed
- [ ] [FAQ](../apps/docs/faq.md) / [Troubleshooting](../apps/docs/troubleshooting.md) updated if support burden expected

---

## See also

- [EDITOR_SPEC.md](EDITOR_SPEC.md) — layout and modes
- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — target users
- [TESTING_STRATEGY.md](TESTING_STRATEGY.md) — behavioral and UX acceptance tests
- [ROADMAP.md](ROADMAP.md) — release milestones
