# @viewfoundry/cli

Command-line tools for ViewFoundry projects and documents.

## Quick start

Scaffold a new project in three commands:

```bash
npx @viewfoundry/cli init my-app --template landing-page
cd my-app
npm install && npm run dev
```

## Init

```bash
viewfoundry init [dir] [--template default|landing-page|dashboard-builder] [--force]
```

| Template            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `default`           | Minimal embed (same shape as `examples/basic-react`) |
| `landing-page`      | Single-page marketing layout with hero + features    |
| `dashboard-builder` | Grid-heavy dashboard with sidebar and stat cards     |

| Flag         | Description                         |
| ------------ | ----------------------------------- |
| `--template` | Template id (default: `default`)    |
| `--force`    | Scaffold into a non-empty directory |

Each template includes Vite, React, `@viewfoundry/vite`, a seed `viewfoundry/document.json`, and component registry stubs.

## Validate and export

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx --imports ./import-map.json --tokens ./tokens.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx --strict
```

### Export options

| Flag        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `--imports` | JSON file mapping component `type` strings to import paths               |
| `--tokens`  | JSON file with style token definitions for codegen                       |
| `--strict`  | Exit non-zero when warnings include missing imports or unresolved tokens |

## Commands

| Command    | Description                                          |
| ---------- | ---------------------------------------------------- |
| `init`     | Scaffold a ViewFoundry + Vite + React project        |
| `validate` | Runs `validateDocument()` on a JSON file             |
| `export`   | Validates then writes TSX via `@viewfoundry/codegen` |

## CLI vs in-app export

| Use case                    | Approach                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| New project                 | `viewfoundry init`                                               |
| Admin panel "Export" button | `generateTsx` in app code with your import map and `styleTokens` |
| CI validation of saved JSON | `viewfoundry validate`                                           |
| One-off TSX file from JSON  | `viewfoundry export` (add import paths manually or post-process) |

Peer dependencies: `@viewfoundry/core@^0.5.0`, `@viewfoundry/codegen@^0.5.0`.

Full API reference: [Package API spec](../package-api-spec.md#viewfoundrycli).

See also [Migration from 0.4 → 0.5](../migration-0.4-0.5.md).
