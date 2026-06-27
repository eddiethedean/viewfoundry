# Basic React example

A ViewFoundry integration with **embed mode** (JSON document editor) and **code-first mode** (board + TSX source editing, v0.7).

## Modes

| URL                                      | Mode                                                      |
| ---------------------------------------- | --------------------------------------------------------- |
| `http://localhost:5173/`                 | Embed — JSON `ViewDocument`, palette, layers, inspector   |
| `http://localhost:5173/?mode=code-first` | Code-first — Button board, Elements/Properties, file undo |

## What it demonstrates

### Embed (default)

- **Component registration** — Button, Card, Stack, Grid, Row, Heading, Text via `@viewfoundry/schema`
- **Edit / Live** — single-viewport studio toggle in `ViewFoundryEditor`
- **Grid layout (v0.3.0)** — Grid and Row containers, canvas drag-and-drop, cell placement
- **Style Editor (v0.4.0)** — Component | Style sub-mode, `node.style`, optional `styleTokens`
- **Persistence** — document JSON saved to `localStorage` (dev seed in `viewfoundry/document.json`)
- **Vite plugin (v0.5.0)** — `virtual:viewfoundry/document` HMR and optional codegen watch
- **Codegen** — `generateTsx` with an import map matching `./components`

### Code-first (`?mode=code-first`)

- **Board fixture** — `src/boards/Button.board.tsx` via `@viewfoundry/board`
- **TSX sync** — prop edits patch `src/code-first/fixture.tsx` via `@viewfoundry/sync`
- **Elements / Properties / Stage** — dual-mode `ViewFoundryEditor` with file undo/redo

## Run locally

From the monorepo root:

```bash
pnpm install
pnpm build
pnpm dev
```

Or from this directory:

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Key files

| File                          | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `src/App.tsx`                 | Embed editor shell, persistence, export     |
| `src/code-first/App.tsx`      | Code-first board editor                     |
| `src/code-first/fixture.tsx`  | Editable TSX source for the Button board    |
| `src/boards/Button.board.tsx` | Board fixture definition                    |
| `src/definitions.ts`          | Registry, component definitions, import map |
| `src/components/`             | React components rendered on canvas/stage   |

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
