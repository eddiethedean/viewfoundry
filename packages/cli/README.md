# @viewfoundry/cli

Command-line tools for ViewFoundry.

## Commands

| Command                | Description                                   |
| ---------------------- | --------------------------------------------- |
| `viewfoundry init`     | Scaffold a ViewFoundry + Vite + React project |
| `viewfoundry validate` | Validate a ViewDocument JSON file             |
| `viewfoundry export`   | Generate TSX from JSON                        |

## Init

```bash
npx @viewfoundry/cli init my-app --template landing-page
cd my-app && npm install && npm run dev
```

Templates: `default`, `landing-page`, `dashboard-builder`.

See [apps/docs/packages/cli.md](../../apps/docs/packages/cli.md).
