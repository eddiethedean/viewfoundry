# Planning documentation index

This folder contains **maintainer planning specs** — design intent, roadmap, and acceptance criteria. These files are **not** published to Read the Docs.

**For adopters:** use the [published docs](https://viewfoundry.readthedocs.io/en/latest/) in `apps/docs/` and the API contract in [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md).

**Last reviewed for v0.4.0:** COMMANDS_AND_HISTORY, CODEGEN_SPEC, TESTING_STRATEGY (see individual files).

## Shipped in v0.4.x (npm `0.4.0`)

| Spec                                               | Topic                                                         |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [EDITOR_SPEC.md](EDITOR_SPEC.md)                   | Editor modes, grid DnD, shortcuts (partially mirrored on RTD) |
| [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md)             | ViewDocument, ViewNode, `style`, grid layout                  |
| [UX_AND_DX.md](UX_AND_DX.md)                       | Studio + integrator UX acceptance                             |
| [COMMANDS_AND_HISTORY.md](COMMANDS_AND_HISTORY.md) | Commands including style mutations                            |
| [CODEGEN_SPEC.md](CODEGEN_SPEC.md)                 | TSX export, `styleTokens`                                     |
| [TESTING_STRATEGY.md](TESTING_STRATEGY.md)         | Unit, e2e, CI gates                                           |

## Planning / may lag code

| Spec                                 | Topic                                                               |
| ------------------------------------ | ------------------------------------------------------------------- |
| [ROADMAP.md](ROADMAP.md)             | Milestone versions (v0.5, v0.8, v1.6, …) — separate from npm semver |
| [POST_1_0.md](POST_1_0.md)           | Post-1.0 features                                                   |
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Product vision                                                      |
| [ARCHITECTURE.md](ARCHITECTURE.md)   | Monorepo layout (high level)                                        |
| [PROP_SCHEMA.md](PROP_SCHEMA.md)     | Prop field design                                                   |
| [RELEASE.md](RELEASE.md)             | Maintainer release checklist                                        |

## Version legend

- **npm semver** (`0.4.0`) — published `@viewfoundry/*` package versions (all packages share one version).
- **Document schema** (`ViewDocument.version: '0.1'`) — JSON document format version.
- **Roadmap milestones** (`v0.5.0`, `v1.6.0`, …) — planned feature bundles; not always tied to the next npm bump.

## Related

- Published docs source: [`apps/docs/`](../apps/docs/)
- API contract: [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md)
- Contributing: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
