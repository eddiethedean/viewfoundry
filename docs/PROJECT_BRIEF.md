# ViewFoundry Project Brief

## One-line description

ViewFoundry is an embeddable visual editor framework that makes real React components editable through a schema-driven no-code canvas.

## Product thesis

Most visual builders either require users to build inside a proprietary platform or require developers to rewrite components into a custom DSL. ViewFoundry should let developers keep their existing React components and expose them to visual editing through typed metadata.

The core value proposition:

> Install ViewFoundry, register your components, and your app becomes visually editable.

Arranging those components on an intuitive **grid** with satisfying **drag and drop** is essential to that promise — it should feel as good as the rest of the editor.

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

## What ViewFoundry is

- A component registry
- A document model
- A React renderer
- A visual editor UI
- A property inspector generator
- A drag/drop and selection system
- A serialization layer
- A code generation layer
- An extension/plugin foundation

## What ViewFoundry is not, at least initially

- Not an arbitrary React source-code editor
- Not a full Figma replacement
- Not a hosted proprietary platform
- Not a CMS by itself
- Not a design system by itself
- Not a replacement for Storybook

## MVP definition

The MVP is successful when a developer can:

1. Install ViewFoundry packages.
2. Register a few React components with prop schemas.
3. Open a visual editor.
4. Drag components onto a canvas.
5. Select, reorder, delete, duplicate, and nest components.
6. Edit props through generated controls.
7. Save/load the page as JSON.
8. Render the JSON document as React.
9. Export the JSON document to readable TSX.

## Post-MVP editor modes

After the MVP, the editor gains explicit modes (see `docs/EDITOR_SPEC.md`):

- **Edit / Live** — toggle in one browser window; same canvas viewport (Phase 4, **critical**)
- **Component Editor** — structure, nesting, and schema-driven props (Edit sub-mode / Phase 4)
- **Grid layout drag/drop** — intuitive CSS Grid–based arrangement with satisfying canvas moves (Phase 5, **critical**)
- **Style Editor** — visual styling via `node.style` tokens (Edit sub-mode / Phase 7)

## North star

ViewFoundry should become the reusable visual editing engine that powers many specialized products. LessonKit Studio is one flagship app built on top of it.
