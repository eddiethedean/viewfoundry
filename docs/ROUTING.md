# Routing

> **Direction (v0.7+):** Code-first routing (**v0.10**) edits route/page TSX in source. JSON `ViewSite` multi-document model is **embed-mode backlog**. See [CODE_FIRST.md](CODE_FIRST.md), [ROADMAP.md](ROADMAP.md).

## Purpose

ViewFoundry today edits a **single page** — one `ViewDocument` per editor session. Real apps have **multiple routes**: `/`, `/about`, `/dashboard/:id`, each with its own layout and components.

This spec plans **multi-route support**: defining routes, switching pages in the editor, rendering the active route at runtime, and codegen for common React routers — without abandoning the serializable JSON document model.

## Goals

- Model multiple pages/routes in a **site** container (or equivalent) that references one `ViewDocument` per route.
- Edit any route in the studio with a **Pages** panel (route switcher).
- Resolve and render the active route in Live mode and exported apps.
- Integrate with **interactions** (`navigate` in TSX or handler props, **v0.11**) for in-app navigation.
- Codegen route tables and per-page components for React Router (or host adapter).
- Stay embeddable: single-route apps keep working with no routing config.

## Non-goals (initial release)

- File-based routing conventions (Next.js App Router) — adapter later.
- Server-side route guards, auth middleware, or SSR data loading.
- Nested route layouts as complex as React Router v6 data APIs — start with flat route → document map.
- URL rewriting / SEO beyond basic path + title metadata.

## Concepts

| Term             | Meaning                                                                            |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Route**        | A path pattern plus the `ViewDocument` rendered at that path.                      |
| **Site**         | Container holding all routes for one app (name TBD: `ViewSite`, `ViewProject`).    |
| **Active route** | The route currently shown in Live mode or matched from the browser URL.            |
| **Navigate**     | Interaction action (v0.8) or `Link`-style component that changes the active route. |

Single-document embeds (current `basic-react`) are a **degenerate site** with one implicit route (`/`).

## Site model (planned v0.9.0)

```ts
export type ViewRoute = {
  id: string;
  /** URL path pattern, e.g. '/', '/about', '/users/:userId' */
  path: string;
  /** Human label for the editor Pages panel */
  label?: string;
  /** Page content */
  document: ViewDocument;
  meta?: {
    title?: string;
    description?: string;
  };
};

export type ViewSite = {
  version: '0.1';
  routes: ViewRoute[];
  /** Route used when path is '/' or unmatched (optional fallback) */
  defaultRouteId?: string;
  meta?: {
    name?: string;
  };
};
```

Storage options (pick during implementation):

1. **One JSON file** — `site.json` with embedded documents (simple, good for small sites).
2. **Split files** — `site.json` + `pages/home.json`, `pages/about.json` (better for large apps).
3. **In-memory only** — host app holds `ViewSite`; editor receives `site` + `activeRouteId` props.

`ViewDocument.version` stays `'0.1'`. Site schema version is separate (`ViewSite.version`).

### Example

```json
{
  "version": "0.1",
  "defaultRouteId": "home",
  "routes": [
    {
      "id": "home",
      "path": "/",
      "label": "Home",
      "document": { "version": "0.1", "root": { "id": "root", "type": "Root", "children": [] } }
    },
    {
      "id": "about",
      "path": "/about",
      "label": "About",
      "document": { "version": "0.1", "root": { "id": "root", "type": "Root", "children": [] } }
    }
  ]
}
```

## Registry & components

### Link / Nav components

Host apps register link components with routing metadata:

```ts
defineComponent(NavLink, {
  type: 'NavLink',
  props: {
    to: routeRef({ label: 'Route' }), // picker in inspector
    children: text({ label: 'Label' }),
  },
});
```

Built-in optional **`RouteRef`** field type in `@viewfoundry/schema` — selects a route id from the current site.

### Route params

Paths like `/users/:userId` expose params to the page document via runtime context (`useRouteParams()`), not as functions in JSON. Bindings (post-v0.8) may map params → props later.

## Runtime (planned `@viewfoundry/react`)

- **`ViewFoundrySiteProvider`** — holds `ViewSite`, active route, navigation function.
- **`ViewRouter`** — matches `window.location.pathname` (or controlled `path` prop) to a route; renders `ViewRenderer` for that route’s document.
- **`navigate(routeId | path, options?)`** — used by interaction interpreter and link components.
- **Backward compatible** — `ViewFoundryProvider` + single `ViewDocument` unchanged.

Optional adapters:

- `createReactRouterRoutes(site)` for React Router v6+
- Host-owned router: ViewFoundry only calls `onNavigate` callback

## Editor (planned v0.9.0)

### Pages panel

- List routes (label + path); add, duplicate, delete, reorder.
- Switching route loads that route’s document into the canvas (same Edit/Live viewport).
- Per-route undo/redo scoped to the active document; site-level commands for route CRUD.

### Route inspector

When no canvas node is selected, or via Pages panel context:

- edit path, label, title meta
- validation: unique paths, valid param syntax, no empty documents

### Live mode

- Toolbar or optional **route picker** to preview any route without changing browser URL (studio).
- Optional **sync URL** in docs embed / host app so `/about` shows About page in Live.

### Interactions integration

v0.8 **`navigate` action** gains full meaning in v0.9:

```json
{
  "type": "navigate",
  "payload": { "routeId": "about" }
}
```

Or `{ "path": "/about" }` for path-based navigation.

## Commands

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `addRoute`       | Add route with path + empty or cloned document |
| `updateRoute`    | Change path, label, meta                       |
| `removeRoute`    | Delete route (guard last route)                |
| `setActiveRoute` | Editor-only: switch canvas document            |
| `duplicateRoute` | Clone route document                           |

Document mutations (`insertNode`, etc.) apply to the **active route’s** document.

## Validation

- Every route has a unique `id` and valid `path`.
- Paths do not collide (normalize trailing slashes).
- Param names are valid identifiers.
- Each route `document` passes `validateDocument()`.
- `defaultRouteId` references an existing route.

## Codegen

- Emit `routes.tsx` (or equivalent) from `ViewSite`.
- One generated component per route (or lazy imports per page file).
- Wire React Router `createBrowserRouter` / `Routes` + `Route` (adapter-specific).
- `navigate` interactions codegen to `useNavigate()` or site helper.

## Package ownership

| Package                | Role                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| `@viewfoundry/core`    | `ViewSite`, `ViewRoute` types; match path; site validation             |
| `@viewfoundry/schema`  | `routeRef` field builder                                               |
| `@viewfoundry/react`   | `ViewFoundrySiteProvider`, `ViewRouter`, `useNavigate`, params hooks   |
| `@viewfoundry/editor`  | Pages panel; active route state; site props on editor                  |
| `@viewfoundry/codegen` | Site + per-route TSX export                                            |
| `@viewfoundry/vite`    | Document HMR (v0.5); dev server history fallback for SPA routes (v0.9) |
| `@viewfoundry/cli`     | `viewfoundry validate site.json`; export multi-page project            |

## Phased delivery (v0.9.0)

### Phase A — Model & single-host navigation

- `ViewSite` / `ViewRoute` types and validation
- Site provider + programmatic `navigate(routeId)`
- Editor Pages panel (switch routes, add/remove)

### Phase B — URL sync & links

- Path matching and browser URL sync in Live mode
- `NavLink` / `routeRef` inspector field
- Interaction `navigate` wired to site router

### Phase C — Codegen & examples

- `examples/landing-page` multi-route (pairs with v0.5.0 example scaffold)
- React Router codegen adapter
- RTD / docs guide

## Relationship to other releases

| Release | Relationship                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------- |
| v0.5.0  | `examples/landing-page` may ship as single-page first; multi-route added in v0.10 (code-first) |
| v0.11.0 | `navigate` / link handlers; full routing in v0.10                                              |

## Open questions

- Whether the editor always edits a `ViewSite` or accepts optional `site` prop with single-doc fallback.
- Shared layout route (nested routes) — **v1.1.0** ([POST_1_0.md](POST_1_0.md))
- 404 / catch-all route — `path: '*'` in MVP or follow-up.

## See also

- [ROADMAP.md](ROADMAP.md) — v0.9.0 milestone
- [INTERACTIONS.md](INTERACTIONS.md) — `navigate` action
- [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md) — single-page `ViewDocument`
- [ARCHITECTURE.md](ARCHITECTURE.md) — package boundaries
- [UX_AND_DX.md](UX_AND_DX.md) — Pages panel and integrator routing requirements
