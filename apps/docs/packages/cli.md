# @viewfoundry/cli

Command-line tools for documents.

```bash
npx @viewfoundry/cli validate ./page.json
npx @viewfoundry/cli export ./page.json ./GeneratedView.tsx
```

| Command    | Description                                            |
| ---------- | ------------------------------------------------------ |
| `validate` | Runs `validateDocument()` on a JSON file               |
| `export`   | Validates then writes TSX via `@viewfoundry/codegen`   |
| `init`     | Stub until v0.5.0 — use `examples/basic-react` for now |

`viewfoundry init` is not implemented in v0.3.x. The CLI uses an empty import map on export; provide import maps in application code for production-ready TSX.
