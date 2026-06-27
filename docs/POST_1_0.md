# Post-1.0 platform features

Features planned **after v1.0.0** stable API. Core packages stay embeddable; capabilities ship as adapters, plugins, or optional packages on the **code-first** path.

## v1.1.0 — Nested routes & shared layouts

Parent routes render a **layout component** with child `<Outlet />` region; child routes nest under path segments.

- Editor: route tree (not flat list)
- Code-first: edits layout + child route TSX files
- React Router nested `Route` structure

Extends [ROUTING.md](ROUTING.md).

## v1.2.0 — Framework adapters

Thin packages or tooling beyond React Router + Vite:

- **Next.js App Router** — file-based routes, RSC boundary rules
- Optional **Remix** route module shape (Codux uses Remix; ViewFoundry stays adapter-optional)

Core packages unchanged; adapters own file layout and import conventions.

## v1.3.0 — Async data & loaders

- Route-level or component **loader** hooks (host implements fetch)
- Loader results wired in TSX or binding helpers
- Live mode shows loading/error states on Stage

Pairs with `examples/dashboard-builder`.

## v1.4.0 — Plugin & extension API

Formal extension points:

- Custom prop field renderers in Properties panel
- Add Elements providers and saved-block sources
- Custom interaction patterns
- Editor panel slots
- **Discover providers** for component scan customization

## v1.5.0+ — Collaboration & advanced (exploratory)

Not committed; evaluate after 1.0 adoption:

- Comments / annotations on Elements tree nodes
- Real-time multi-user editing (CRDT or lock-based)
- Git-adjacent review flows in embed hosts
- Accessibility audit panel
- i18n — localized prop values
- Motion / transition props
- Visual Tailwind class editing (Codux gap)

## Embed-mode backlog (post-1.0, if needed)

JSON-only features deferred by the code-first pivot — implement only if CMS/embed customers require them:

- `ViewDocument` slots, bindings, repeat, forms
- JSON `interactions[]` interpreter extensions
- Multi-document `ViewSite` routing without source files

See [CODE_FIRST.md](CODE_FIRST.md) and [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md).

## Removed / superseded

- **v1.6.0 Existing project import** — moved to **v0.9.0** (`viewfoundry import`, `@viewfoundry/discover`)

## Explicit non-goals

- Proprietary desktop IDE (contrast: Codux)
- Arbitrary JavaScript injection from visual panels
- Full Figma-style freeform canvas
- Replacing host auth, billing, or CMS storage

## See also

- [ROADMAP.md](ROADMAP.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [UX_AND_DX.md](UX_AND_DX.md)
