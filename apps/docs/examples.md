# Example applications

ViewFoundry ships three **embed-mode** reference applications (JSON document editing). **Code-first** examples are planned from v0.7 — see [Roadmap & direction](roadmap-and-direction.md).

Each maps to a **`viewfoundry init`** template:

| Example / template                                                                                               | Init flag                      | What it demonstrates                                                                   |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react)             | `--template default`           | Minimal embed: Button, Card, Stack, Grid, Row, Heading, Text; localStorage; TSX export |
| [`examples/landing-page`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/landing-page)           | `--template landing-page`      | Marketing single-page: hero, feature grid, CTA; style tokens                           |
| [`examples/dashboard-builder`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/dashboard-builder) | `--template dashboard-builder` | Dashboard grid: sidebar, stat cards, dense placement                                   |

## Quick start (no clone)

```bash
npx @viewfoundry/cli init my-app --template landing-page
cd my-app
npm install
npm run dev
```

Edit `viewfoundry/document.json` while the dev server runs — `@viewfoundry/vite` hot-reloads the canvas.

## Run from the monorepo

Contributors and evaluators can run examples locally after cloning:

```bash
git clone https://github.com/eddiethedean/viewfoundry.git
cd viewfoundry
pnpm install
pnpm build
pnpm dev                    # basic-react (default)
pnpm --filter landing-page dev
pnpm --filter dashboard-builder dev
```

## Shared patterns

All three examples include:

- `viewfoundry/document.json` — seed document (file is source of truth in dev)
- `@viewfoundry/vite` — `virtual:viewfoundry/document` HMR
- `src/definitions.ts` — registry, import map, style tokens
- `ViewFoundryEditor` with Edit/Live, Style sub-mode, and TSX export

See [Integrate into an existing app](integrate-existing-app.md) for folder layout and [Production patterns](production-patterns.md) for shipping without the editor in production.

## Try without cloning

[Open the Studio](studio.md) — embedded editor in these docs using the same demo components as `basic-react`.

## Related

- [Getting started](getting-started.md)
- [CLI package guide](packages/cli.md)
- [Vite document workflow](packages/vite.md)
