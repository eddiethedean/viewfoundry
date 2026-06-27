# Drag-and-drop & layout research (Figma + Wix)

**Status:** Planning reference for **v0.7+** Stage and layout work  
**Informs:** [ROADMAP.md](ROADMAP.md), [EDITOR_SPEC.md](EDITOR_SPEC.md), [UX_AND_DX.md](UX_AND_DX.md)

ViewFoundry combines **Figma’s structural layout model** with **Wix’s mature drag-and-drop feedback**, outputting real React/CSS (code-first) rather than a hosted platform or design file.

---

## Two reference products

|                    | **Wix**                                                   | **Figma**                                       |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| **Role**           | Website builder                                           | Design tool                                     |
| **Default layout** | Free-form canvas → Studio **containers / stacks / grids** | **Auto Layout** (flex/grid semantics)           |
| **DnD output**     | Published site                                            | Design layers (handoff to dev)                  |
| **Responsive**     | Breakpoint cascade + overrides + per-element behavior     | Auto Layout resize + constraints                |
| **Best for us**    | Stage feedback, layers, responsive authoring UX           | Layout semantics, component insert, snap/guides |

Sources: [Wix drag-and-drop](https://www.wix.com/blog/what-is-drag-and-drop-in-web-design), [Wix Studio stacks](https://support.wix.com/en/article/studio-editor-stacking-elements), [Wix flex vs grid](https://support.wix.com/en/article/studio-editor-choosing-between-flexbox-based-and-grid-based-tools), [Wix breakpoints](https://support.wix.com/en/article/studio-editor-designing-across-breakpoints), [Figma auto layout](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout), [Figma snapping](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-position-and-dimensions), [Figma component insert](https://help.figma.com/hc/en-us/articles/360039150173-Create-and-insert-component-instances).

---

## Wix lessons

### Classic Editor — feedback over freedom

- Pixel drag with **snap-to-grid** and **Smart Guides** (alignment lines while moving)
- Toolbar **X/Y, size, rotation, z-order** for precision
- **Multi-element drag handles** when items are aligned
- Copy/paste elements **across pages**

**Takeaway:** DnD quality is mostly **affordances** — ghost, valid-target highlight, snap, blocked cursor, settle animation.

### Wix Studio — structured layout tools

Wix evolved from absolute positioning toward **CSS-real primitives**:

| Tool                  | CSS basis  | Use when                                         |
| --------------------- | ---------- | ------------------------------------------------ |
| **Container**         | Parent box | Groups children                                  |
| **Stack**             | Flexbox    | Row/column flow; **prevents overlap**; fixed gap |
| **Section grid**      | Grid cells | Section rows/columns                             |
| **Advanced CSS grid** | Full grid  | Per-cell `fr`, min/max, % per breakpoint         |

Behaviors worth copying:

- **Parent/child hierarchy** visible in Layers; reparenting is explicit
- **Stack suggestion** when adjacent elements may overlap at smaller widths
- **Nest containers** (stack in stack in grid cell)
- **Document which tool** — flex vs grid choice is user-facing, not implicit

**Takeaway:** Code-first ViewFoundry should expose **Stack / Grid / Section** as registered layout components; drops target a **layout tool**, not anonymous `div`s.

### Responsive authoring

- Design **desktop first**; changes **cascade down** to tablet/mobile
- **Overrides** on smaller breakpoints (do not affect larger)
- Per-element **responsive behavior** (scale proportionally, fixed, etc.)
- **Reset to desktop** when overrides go wrong

**Pain point:** Users confuse cells, section grids, and layers — overlap and padding fights are common without clear hierarchy and “prevent overlap” defaults.

**Takeaway:** v0.13 breakpoint switcher needs **inheritance vs override** UI and one-click reset.

### Layers panel

- Drag-reorder in tree (page order + z-order)
- **Parent-first vs child-first** canvas click mode
- Select obscured elements from tree

**Takeaway:** Elements panel + Stage click mode solves “can’t select button inside card.”

---

## Figma lessons

### Auto Layout ≈ production CSS

| Figma                      | CSS              |
| -------------------------- | ---------------- |
| Horizontal / vertical flow | `flex-direction` |
| Gap                        | `gap`            |
| Padding                    | `padding`        |
| Hug contents               | `fit-content`    |
| Fill container             | `flex: 1`        |
| Fixed                      | explicit size    |
| Grid flow                  | CSS Grid         |
| Nested frames              | nested flex/grid |

Content changes **reflow** without manual nudging.

**Takeaway:** Properties/Styles panels expose **Hug / Fill / Fixed**; patches write flex/grid CSS — not absolute coordinates.

### Drag feedback

- **Smart guides** — alignment lines (edge/center)
- **Snap to objects**; hold modifier to **disable snap**
- **Distance redlines** (px to siblings/frame)
- **Layout grids** on frames (columns, gutters)
- **Dashed valid drop region** when dragging from Assets
- **Smart selection** — equal spacing between multi-selected items

**Takeaway:** High-impact Stage overlays for v0.7–v0.8; see [global DnD bar](#global-dnd-quality-bar) in [UX_AND_DX.md](UX_AND_DX.md).

### Assets → canvas

- Search Assets; **Shift+I** quick insert
- Drag component → **instance** on canvas
- **Alt + drag** onto instance → **swap** component
- Variants preview before insert

**Takeaway:** Maps to Add Elements (v0.9): ghost on Stage, modifier swap, project library variants.

---

## What not to copy

| Pattern                             | Reason                                |
| ----------------------------------- | ------------------------------------- |
| Wix **absolute X/Y** as default     | Fights responsive React/CSS; bad a11y |
| Wix **hosted platform**             | ViewFoundry embeds in host apps       |
| Figma **freeform full-page** canvas | Production UI needs structure         |
| **Silent Responsive AI** rewrite    | Suggest stack/grid; user confirms     |
| Unlimited **z-index** stacking      | Prefer DOM order + flex/grid          |

---

## ViewFoundry layout tool model (code-first)

Registered layout components (host or default kit):

| ViewFoundry tool | Maps to                           | Wix analogue            | Figma analogue            |
| ---------------- | --------------------------------- | ----------------------- | ------------------------- |
| **Stack**        | Flex row/column container         | Stack                   | Auto Layout frame         |
| **Grid**         | CSS Grid container                | Section / advanced grid | Grid auto layout          |
| **Section**      | Page section wrapper + inner grid | Section                 | Top-level frame           |
| **Box**          | Generic container                 | Container               | Frame without auto layout |

DnD rules:

1. Drop from Add Elements → insert into **valid parent** (schema `allowedChildren`)
2. Drag on Stage → **reparent** or **reorder** within Stack; **cell placement** within Grid
3. Invalid drop → blocked cursor + plain-language reason
4. Reparent writes JSX + updates imports

Embed mode (v0.1–v0.6) keeps JSON `layout.grid` — unchanged; apply the same **visual feedback** bar on Canvas where possible.

---

## Release mapping

| Release   | Figma/Wix-inspired deliverables                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **v0.7**  | Smart guides, distance hints, ghost + dashed drop zone, parent/child click mode, layout tool drops (Stack/Grid), group move, Escape cancel |
| **v0.8**  | Hug/Fill/Fixed sizing, gap/padding scrub on Stage, computed styles                                                                         |
| **v0.9**  | Add Elements drag insert, Alt+swap, quick insert shortcut, “Stack these?” overlap hint                                                     |
| **v0.10** | Section layout unit, cross-page section copy                                                                                               |
| **v0.12** | Multi-select drag, saved blocks drag from library                                                                                          |
| **v0.13** | Breakpoint cascade/override UI, reset override, per-breakpoint stack order                                                                 |

Full milestone detail in [ROADMAP.md](ROADMAP.md).

---

## Global DnD quality bar

Every author-facing drag operation must:

1. Show a **ghost** (reduced opacity) following the cursor
2. **Highlight valid drop targets** before release; **dashed outline** on active target
3. Show **blocked cursor + reason** on invalid targets
4. **Snap** to cells/edges; **modifier disables snap** for precision
5. Play a brief **settle animation** on successful drop (~150–200ms)
6. **Sync Elements tree** order with Stage immediately
7. Support **Escape** to cancel and restore placeholder
8. **Undo** restores prior layout in one step
9. Use **component labels** in errors, not raw ids

Embed-mode grid DnD (shipped v0.3) already targets items 1–5 and 7–9 — extend to code-first JSX reparenting in v0.7.

---

## See also

- [CODE_FIRST.md](CODE_FIRST.md) — code-first strategy
- [EDITOR_SPEC.md](EDITOR_SPEC.md) — Stage DnD and layout tool spec
- [UX_AND_DX.md](UX_AND_DX.md) — acceptance bars per release
- [ROADMAP.md](ROADMAP.md) — v0.7–v0.13 milestones
