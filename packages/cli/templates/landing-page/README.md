# Landing page example

Marketing single-page layout using **embed-mode** JSON editing: hero, feature cards, and CTA — seeded from `viewfoundry/document.json`. **Code-first** page editing is planned for v0.10 — see [Roadmap & direction](https://viewfoundry.readthedocs.io/en/latest/roadmap-and-direction.html).

## What it demonstrates

- Pre-built **landing page** document with grid placement
- **Style tokens** for brand colors
- **Edit / Live** studio, TSX export, and Vite document HMR via `@viewfoundry/vite`

## Run locally

From the monorepo root:

```bash
pnpm install
pnpm build
pnpm --filter landing-page dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Edit `viewfoundry/document.json` while the dev server runs to hot-reload the canvas.

## Learn more

- [Getting started](https://viewfoundry.readthedocs.io/en/latest/getting-started.html)
- [Grid layout guide](https://viewfoundry.readthedocs.io/en/latest/grid-layout.html)
