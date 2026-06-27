# Planning documentation index

This folder contains **maintainer planning specs** — design intent, roadmap, and acceptance criteria. These files are **not** published to Read the Docs (except where mirrored in `apps/docs/`).

**For adopters:** use the [published docs](https://viewfoundry.readthedocs.io/en/latest/) in `apps/docs/` and the API contract in [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md). **Product direction:** [apps/docs/roadmap-and-direction.md](../apps/docs/roadmap-and-direction.md).

**Last reviewed:** code-first pivot, Figma/Wix DnD research, v0.7–v1.0 roadmap (see individual files).

## Strategic direction (v0.7+)

| Spec                                                     | Topic                                                |
| -------------------------------------------------------- | ---------------------------------------------------- |
| [CODE_FIRST.md](CODE_FIRST.md)                           | Code-first pivot, Codux patterns, dual-mode strategy |
| [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md) | Figma/Wix DnD feedback, layout tools, responsive UX  |
| [ROADMAP.md](ROADMAP.md)                                 | Milestones v0.7–v1.0                                 |
| [UX_AND_DX.md](UX_AND_DX.md)                             | Global DnD bar + per-release acceptance              |

## Shipped in v0.5.x / v0.6.x (npm `0.5.0` / `0.6.0`)

| Spec                                               | Topic                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| [EDITOR_SPEC.md](EDITOR_SPEC.md)                   | Editor modes, Stage DnD, layout tools (target) |
| [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md)             | ViewDocument embed mode                        |
| [COMMANDS_AND_HISTORY.md](COMMANDS_AND_HISTORY.md) | Document commands; file history planned v0.7   |
| [CODEGEN_SPEC.md](CODEGEN_SPEC.md)                 | TSX export (embed mode)                        |
| [TESTING_STRATEGY.md](TESTING_STRATEGY.md)         | Unit, e2e, DnD acceptance                      |
| [COMPONENT_REGISTRY.md](COMPONENT_REGISTRY.md)     | Registry; discover planned v0.9                |
| [PROP_SCHEMA.md](PROP_SCHEMA.md)                   | Prop fields + TS inference (v0.7)              |

## Planning / may lag code

| Spec                                               | Topic                                |
| -------------------------------------------------- | ------------------------------------ |
| [POST_1_0.md](POST_1_0.md)                         | Post-1.0 features; embed backlog     |
| [PROJECT_BRIEF.md](PROJECT_BRIEF.md)               | Product vision                       |
| [ARCHITECTURE.md](ARCHITECTURE.md)                 | Monorepo; sync, board, discover      |
| [INTERACTIONS.md](INTERACTIONS.md)                 | v0.11 code-first; JSON embed backlog |
| [ROUTING.md](ROUTING.md)                           | v0.10 code-first; JSON embed backlog |
| [SLOTS.md](SLOTS.md)                               | Embed backlog                        |
| [DATA_BINDING.md](DATA_BINDING.md)                 | Embed backlog                        |
| [REPEAT.md](REPEAT.md)                             | Embed backlog                        |
| [FORMS.md](FORMS.md)                               | Embed backlog                        |
| [CLIPBOARD_AND_BLOCKS.md](CLIPBOARD_AND_BLOCKS.md) | v0.12 code-first                     |
| [RESPONSIVE.md](RESPONSIVE.md)                     | v0.13 code-first                     |
| [RELEASE.md](RELEASE.md)                           | Maintainer release checklist         |

## Version legend

- **npm semver** (`0.5.0`) — published `@viewfoundry/*` package versions (all packages share one version).
- **Document schema** (`ViewDocument.version: '0.1'`) — embed-mode JSON format; frozen at v1.0.
- **Roadmap milestones** (`v0.7.0`, `v1.0.0`, …) — see [CODE_FIRST.md](CODE_FIRST.md).

## Related

- Published docs: [`apps/docs/`](../apps/docs/)
- API contract: [`specs/PACKAGE_API_SPEC.md`](../specs/PACKAGE_API_SPEC.md)
- Contributing: [`CONTRIBUTING.md`](../CONTRIBUTING.md)
