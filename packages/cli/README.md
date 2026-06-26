# @viewfoundry/cli

Command-line tools for ViewFoundry documents.

## Available commands

| Command                                    | Status                                                 |
| ------------------------------------------ | ------------------------------------------------------ |
| `viewfoundry validate <file.json>`         | Uses `@viewfoundry/core` `validateDocument()`          |
| `viewfoundry export <file.json> [out.tsx]` | Generates TSX via `@viewfoundry/codegen`               |
| `viewfoundry init`                         | **Stub** — prints guidance; full scaffolding in v0.5.0 |

## Usage

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
```

`export` validates the document before writing output. Provide an import map in application code when generating production-ready TSX; the CLI uses an empty import map and emits warnings for missing component imports.

## Stub notice

`viewfoundry init` is not implemented in v0.3.x. Use `examples/basic-react` in the repository as a starting point until v0.5.0.
