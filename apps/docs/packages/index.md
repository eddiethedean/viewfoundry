# Packages

ViewFoundry publishes lockstep-versioned packages under the `@viewfoundry` scope.

```{note}
**Planned (v0.7+):** `@viewfoundry/sync`, `@viewfoundry/board`, `@viewfoundry/discover` — see [Roadmap & direction](../roadmap-and-direction.md).
```

```{toctree}
:maxdepth: 1

core
schema
react
editor
codegen
cli
vite
```

Install all packages you use at the **same version** (currently `0.6.0`).

## Shipped

| Package                | Role                                                     |
| ---------------------- | -------------------------------------------------------- |
| `@viewfoundry/core`    | Document model, registry, commands, history (embed mode) |
| `@viewfoundry/schema`  | `defineComponent`, prop field builders                   |
| `@viewfoundry/react`   | `ViewRenderer`, provider, hooks                          |
| `@viewfoundry/editor`  | `ViewFoundryEditor` and editor panels                    |
| `@viewfoundry/codegen` | `generateTsx`, `generateJson` (embed mode export)        |
| `@viewfoundry/cli`     | `init`, `validate`, and `export`                         |
| `@viewfoundry/vite`    | Document HMR and validation overlay via Vite plugin      |

## Planned (v0.7+)

| Package                 | Role                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `@viewfoundry/sync`     | TSX/CSS parse, selection map, safe AST patches                |
| `@viewfoundry/board`    | `createBoard()`, `.board.tsx` fixtures                        |
| `@viewfoundry/discover` | Scan exports; bootstrap registry (`viewfoundry import`, v0.9) |

See [Package API spec](../package-api-spec.md) for the shipped public API (synced from GitHub on each docs build). Code-first APIs will be added to the spec as they ship.
