# @viewfoundry/cli

Command-line tools for ViewFoundry documents.

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx --imports ./import-map.json --tokens ./tokens.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx --strict
```

## Export options

| Flag        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| `--imports` | JSON file mapping component `type` strings to import paths (see below)   |
| `--tokens`  | JSON file with style token definitions for codegen                       |
| `--strict`  | Exit non-zero when warnings include missing imports or unresolved tokens |

Example `import-map.json`:

```json
{
  "Button": { "importPath": "./components/Button", "exportName": "Button" },
  "Grid": { "importPath": "./components/Grid", "exportName": "Grid" }
}
```

## Commands

| Command    | Status        | Description                                                                                  |
| ---------- | ------------- | -------------------------------------------------------------------------------------------- |
| `validate` | **Works**     | Runs `validateDocument()` on a JSON file                                                     |
| `export`   | **Works**     | Validates then writes TSX via `@viewfoundry/codegen`                                         |
| `init`     | Stub (v0.5.0) | Use `examples/basic-react` or [Integrate into an existing app](../integrate-existing-app.md) |

## CLI vs in-app export

| Use case                    | Approach                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| Admin panel "Export" button | `generateTsx` in app code with your import map and `styleTokens` |
| CI validation of saved JSON | `viewfoundry validate`                                           |
| One-off TSX file from JSON  | `viewfoundry export` (add import paths manually or post-process) |

`export` requires an import map for usable output. Pass `--imports` with a JSON map, or use `generateTsx` in app code with your import map and `styleTokens`, matching [Component registration](../component-registration.md).

Peer dependency: `@viewfoundry/core@^0.4.1`.
