# Dashboard builder example

A grid-heavy dashboard layout (**embed mode**): sidebar navigation, stat cards, chart placeholder, and table area — seeded from `viewfoundry/document.json`. **Code-first** editing is planned from v0.7 — see [Roadmap & direction](https://viewfoundry.readthedocs.io/en/latest/roadmap-and-direction.html).

## What it demonstrates

- Dense **CSS Grid** dashboard composition
- Nested **Card** containers with typography and style tokens
- **Edit / Live** studio, TSX export, and Vite document HMR via `@viewfoundry/vite`

## Run locally

From the monorepo root:

```bash
pnpm install
pnpm build
pnpm --filter dashboard-builder dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Learn more

- [Getting started](https://viewfoundry.readthedocs.io/en/latest/getting-started.html)
- [Grid layout guide](https://viewfoundry.readthedocs.io/en/latest/grid-layout.html)
