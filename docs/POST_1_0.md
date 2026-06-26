# Post-1.0 platform features

Features planned **after v1.0.0** stable API. Core remains framework-agnostic; capabilities ship as adapters, plugins, or optional packages.

## v1.1.0 — Nested routes & shared layouts

Parent routes render a **layout document** with child `<Outlet />` region; child routes nest under path segments.

- `ViewRoute.children`, layout `ViewDocument` with outlet slot
- Editor: route tree (not flat list)
- Codegen: React Router nested `Route` elements

Extends [ROUTING.md](ROUTING.md).

## v1.2.0 — Framework adapters

Thin packages or codegen targets beyond React Router:

- **Next.js App Router** — file-based routes, RSC boundary rules (client components only in editor model)
- Optional **Remix** route module shape

Core packages unchanged; adapters own file layout and import conventions.

## v1.3.0 — Async data & loaders

- Route-level or node-level **loader** references (host implements fetch)
- Loader results exposed as binding sources and route context
- Editor: pick loader, map fields to props; Live mode shows loading/error states

Pairs with `examples/dashboard-builder`.

## v1.4.0 — Plugin & extension API

Formal extension points (architecture today is aspirational):

- Custom prop field renderers in inspector
- Palette providers and saved-block sources
- Custom interaction action types
- Codegen plugins (per-component or per-site hooks)
- Editor panel slots
- **Component discovery providers** for existing React projects (see v1.6.0 in [ROADMAP.md](ROADMAP.md))

## v1.6.0 — Existing project import

Load an **existing React project** into ViewFoundry without registering every component by hand:

- CLI workflow to scan configured paths and list exportable components
- Generate starter `defineComponent` stubs and codegen import maps
- Optional TypeScript-based prop schema inference (review before publish)
- Gradual adoption — only confirmed components appear in the palette

Pairs with [v1.2.0 framework adapters](#v120---framework-adapters) for Next.js and other host layouts.

## v1.5.0+ — Collaboration & advanced (exploratory)

Not committed; evaluate after 1.0 adoption:

- Comments / annotations on nodes
- Real-time multi-user editing (CRDT or lock-based)
- Version history / document branches
- Accessibility audit panel (aria metadata in registry)
- i18n — localized prop values per locale
- Motion / transition props (host animation library)

## Explicit non-goals

- Arbitrary JavaScript in documents
- Full Figma-style freeform canvas
- Replacing host auth, billing, or CMS storage

## See also

- [ROADMAP.md](ROADMAP.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [UX_AND_DX.md](UX_AND_DX.md) — post-1.0 per-area requirements
