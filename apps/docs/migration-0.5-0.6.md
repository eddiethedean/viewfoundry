# Migration from 0.5 → 0.6

ViewFoundry **0.6.0** adds the [Read the Docs](https://viewfoundry.readthedocs.io/en/latest/) documentation site and an embedded browser **Studio**. There are **no document schema changes** and **no breaking public API changes** — `ViewDocument.version` stays `'0.1'`.

## Upgrade packages

Install all `@viewfoundry/*` packages at **0.6.0** together:

```bash
npm install @viewfoundry/core@0.6.0 @viewfoundry/schema@0.6.0 @viewfoundry/react@0.6.0 @viewfoundry/editor@0.6.0 @viewfoundry/codegen@0.6.0 @viewfoundry/cli@0.6.0 @viewfoundry/vite@0.6.0
```

Peer dependency ranges bump to `^0.6.0` — upgrade all packages together.

## What is new

| Area                | 0.5.x                             | 0.6.0                                                           |
| ------------------- | --------------------------------- | --------------------------------------------------------------- |
| User docs           | README + GitHub planning specs    | Published site: getting started, guides, package reference, FAQ |
| Try without clone   | Local `examples/basic-react` only | [Embedded Studio](studio.md) on Read the Docs                   |
| Monorepo docs build | —                                 | `pnpm docs:build` and `pnpm docs:preview`                       |

## Breaking changes

None for document JSON or public editor/runtime APIs.

## Related

- [What changed in 0.6.0?](faq.md#what-changed-in-060)
- [Migration from 0.4 → 0.5](migration-0.4-0.5.md)
- [Changelog](changelog.md)
