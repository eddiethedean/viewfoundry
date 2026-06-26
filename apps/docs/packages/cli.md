# @viewfoundry/cli

Command-line tools for ViewFoundry documents.

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
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

`export` uses an empty import map by default. Production TSX should use import maps from your application, matching [Component registration](../component-registration.md).

Peer dependency: `@viewfoundry/core@^0.4.0`.
