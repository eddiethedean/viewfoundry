# Basic React example

A minimal ViewFoundry integration: registered components, visual editor, localStorage persistence, and TSX export.

## What it demonstrates

- **Component registration** — Button, Card, Stack, Grid, Row, Heading, Text via `@viewfoundry/schema`
- **Edit / Live** — single-viewport studio toggle in `ViewFoundryEditor`
- **Grid layout (v0.3.0)** — Grid and Row containers, canvas drag-and-drop, cell placement
- **Style Editor (v0.4.0)** — Component | Style sub-mode, `node.style`, optional `styleTokens`
- **Persistence** — document JSON saved to `localStorage` (dev seed in `viewfoundry/document.json`)
- **Vite plugin (v0.5.0)** — `virtual:viewfoundry/document` HMR and optional codegen watch
- **Codegen** — `generateTsx` with an import map matching `./components`

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Key files

| File                 | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `src/App.tsx`        | Editor shell, persistence, export drawer    |
| `src/definitions.ts` | Registry, component definitions, import map |
| `src/components/`    | React components rendered on the canvas     |

## Import map

Codegen needs to know where each node type is imported from:

```ts
export const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Grid: { importPath: './components', exportName: 'Grid' },
  // ...
};
```

Paths are relative to the generated TSX file location.

## Learn more

- [Getting started](https://viewfoundry.readthedocs.io/en/latest/getting-started.html)
- [Grid layout guide](https://viewfoundry.readthedocs.io/en/latest/grid-layout.html)
- [Try the Studio](https://viewfoundry.readthedocs.io/en/latest/studio.html) without cloning

## E2E tests

Playwright tests live in `e2e/`. From the repo root:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```
