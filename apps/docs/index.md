# ViewFoundry

ViewFoundry is an embeddable visual editor framework for React applications. Register your real components with typed metadata and get a no-code canvas, property inspector, document model, undo/redo, and TSX export.

```{toctree}
:maxdepth: 2
:caption: Getting started

getting-started
integrate-existing-app
studio
examples
```

```{toctree}
:maxdepth: 2
:caption: Guides

component-registration
grid-layout
editor-shortcuts
production-patterns
security
architecture
```

```{toctree}
:maxdepth: 2
:caption: Reference

packages/index
package-api-spec
faq
troubleshooting
changelog
```

```{toctree}
:maxdepth: 1
:caption: Migrations

migration-0.2-0.3
migration-0.3-0.4
migration-0.4-0.5
```

## I want to…

| Goal                                      | Start here                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Scaffold a new Vite + React app           | [Getting started — Quick start (CLI)](getting-started.md#quick-start-recommended)       |
| Add ViewFoundry to an existing Vite app   | [Integrate into an existing app](integrate-existing-app.md)                             |
| Try the editor without installing         | [Open the Studio](studio.md)                                                            |
| Render saved JSON without the editor      | [Production patterns — runtime-only](production-patterns.md#editor-vs-runtime-packages) |
| Export or validate TSX in CI              | [Production patterns — CI validation](production-patterns.md#ci-validation)             |
| Understand package vs document versioning | [FAQ](faq.md)                                                                           |
| Browse all three reference apps           | [Example applications](examples.md)                                                     |

## Quick links

- [Try the Studio](studio.md) — interactive editor embedded in these docs
- [Package API reference](package-api-spec.md) — full public API contract
- [Example applications](examples.md) — basic-react, landing-page, dashboard-builder
- [Production patterns](production-patterns.md) — ship runtime-only, lazy editor, CI validate
- [GitHub repository](https://github.com/eddiethedean/viewfoundry)

## Status

ViewFoundry **v0.5.0** is early-access software. Package semver (`0.5.0`) is separate from the document schema version (`ViewDocument.version: '0.1'`). See the [roadmap](https://github.com/eddiethedean/viewfoundry/blob/main/docs/ROADMAP.md) for planned features.
