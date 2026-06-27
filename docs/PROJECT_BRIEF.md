# ViewFoundry Project Brief

## One-line description

ViewFoundry is an embeddable visual editor framework that makes real React components editable — by writing directly to your TSX and CSS, or via a JSON embed mode for CMS-style products.

## Product thesis

Most visual builders either trap users in a proprietary platform or force a custom DSL. **Codux** showed that React teams want visual editing with **source code as the output**. ViewFoundry applies that lesson while staying **embeddable** in your product (not a desktop IDE).

From **v0.7**, the primary path is **code-first**: visual edits patch `.tsx` and stylesheet files; boards isolate components for focused editing. The v0.1–v0.6 **ViewDocument JSON** path remains **embed mode** for hosts that store pages as data (browser Studio, admin CMS).

The core value proposition:

> Embed ViewFoundry in your app — or open an existing React project — and edit components visually with changes you can commit.

See [CODE_FIRST.md](CODE_FIRST.md) for the full pivot.

## Target users

### Primary user

React developers building products that need admin-configurable or non-technical editing experiences.

Examples:

- Course builders
- CMS-like apps
- Internal dashboards
- Landing page builders
- Design-system-driven websites
- Documentation sites
- Customer-facing configuration tools

### Secondary user

Non-technical editors who need a safe, constrained no-code UI over developer-approved components.

Usability requirements for both audiences are defined in [UX_AND_DX.md](UX_AND_DX.md). Editor panels follow **Codux** patterns (Stage, Elements, Properties, Styles, Add Elements) and **Figma/Wix** drag-and-drop and layout conventions — see [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

## What ViewFoundry is

- A component registry (manual or discovered)
- **Code-first sync** — AST patch layer writing TSX/CSS (**v0.7+**)
- **Boards** — isolated component fixtures (**v0.7+**)
- **Embed document model** — JSON `ViewDocument` for CMS hosts (v0.1–v0.6)
- A React renderer
- A visual editor UI (embeddable)
- Property and style panels generated from schema and/or TypeScript
- Drag/drop and selection on the Stage
- Optional TSX codegen (embed mode)
- An extension/plugin foundation

## What ViewFoundry is not

- Not a proprietary desktop IDE (contrast: Codux)
- Not a hosted Wix-style platform
- Not a CMS or design system by itself
- Not a full Figma replacement
- Not a replacement for Storybook (boards complement it)

## MVP definition (v0.1 — shipped)

The original MVP used JSON documents. It remains valid as **embed mode**:

1. Install ViewFoundry packages.
2. Register React components with prop schemas.
3. Open a visual editor.
4. Drag components onto a canvas.
5. Select, reorder, delete, duplicate, and nest components.
6. Edit props through generated controls.
7. Save/load the page as JSON.
8. Render the JSON document as React.
9. Export the JSON document to readable TSX.

## Post-MVP direction (v0.7+)

| Capability                                          | Release     | Mode       |
| --------------------------------------------------- | ----------- | ---------- |
| Code-first TSX/CSS editing, boards, sync, Stage DnD | **v0.7.0**  | Code-first |
| Styles panel, Hug/Fill/Fixed, Theme Manager         | **v0.8.0**  | Code-first |
| Add Elements, Alt+swap, project discovery           | **v0.9.0**  | Code-first |
| App pages, Sections, routing in source              | **v0.10.0** | Code-first |
| Interactions as TSX handlers                        | **v0.11.0** | Code-first |
| Clipboard & saved blocks                            | **v0.12.0** | Code-first |
| Responsive preview, cascade/override UI             | **v0.13.0** | Code-first |
| Stable API                                          | **v1.0.0**  | Both       |
| Framework adapters, plugins                         | **v1.1+**   | Code-first |

Shipped embed-mode features (Edit/Live, grid, `node.style`, CLI, docs) remain supported. See [ROADMAP.md](ROADMAP.md).

## North star

ViewFoundry becomes the **embeddable** visual editing engine for React products — code-first for developer teams, JSON embed for data-driven hosts.
