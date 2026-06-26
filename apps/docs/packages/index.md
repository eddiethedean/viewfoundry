# Packages

ViewFoundry publishes lockstep-versioned packages under the `@viewfoundry` scope.

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

Install all packages you use at the **same version** (currently `0.5.0`).

| Package                | Role                                                    |
| ---------------------- | ------------------------------------------------------- |
| `@viewfoundry/core`    | Document model, registry, commands, history, validation |
| `@viewfoundry/schema`  | `defineComponent`, prop field builders                  |
| `@viewfoundry/react`   | `ViewRenderer`, provider, hooks                         |
| `@viewfoundry/editor`  | `ViewFoundryEditor` and editor panels                   |
| `@viewfoundry/codegen` | `generateTsx`, `generateJson`                           |
| `@viewfoundry/cli`     | `viewfoundry validate` / `export`                       |
| `@viewfoundry/vite`    | Document HMR and validation overlay via Vite plugin     |
| `@viewfoundry/cli`     | `init`, `validate`, and `export`                        |

See [PACKAGE_API_SPEC.md](https://github.com/eddiethedean/viewfoundry/blob/main/specs/PACKAGE_API_SPEC.md) for the full public API surface.
