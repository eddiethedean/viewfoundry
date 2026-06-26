# Implementation Roadmap

## Phase 0: Repository foundation

Deliverables:

- pnpm workspace
- TypeScript config
- package structure
- build tooling
- Vitest setup
- lint/format scripts
- basic example app

Acceptance criteria:

- `pnpm install` works
- `pnpm build` works
- `pnpm test` works
- all packages compile

## Phase 1: Core engine

Deliverables:

- document model
- node utilities
- component registry
- validation
- command system
- history system
- selection model

Acceptance criteria:

- can create document
- can insert/move/delete/update nodes
- can undo/redo
- registry detects duplicate component types
- validation catches missing component types and duplicate node IDs

## Phase 2: Schema helpers

Deliverables:

- `defineComponent`
- prop field builders
- default prop generation
- simple prop validation

Acceptance criteria:

- component definitions are typed
- inspector can consume prop schemas
- default props are applied when inserting nodes

## Phase 3: React runtime

Deliverables:

- `ViewFoundryProvider`
- `ViewRenderer`
- component resolver
- missing component fallback
- hooks

Acceptance criteria:

- JSON document renders as React
- children render recursively
- missing component renders a clear placeholder
- runtime does not require editor package

## Phase 4: Editor MVP

Deliverables:

- editor shell
- palette
- canvas
- inspector
- toolbar
- selection overlay
- drag/drop insert
- delete/duplicate
- undo/redo

Acceptance criteria:

- user can build a small UI visually
- props update live
- JSON state can be saved and reloaded

## Phase 5: Codegen

Deliverables:

- TSX generation
- import map
- warnings
- tests

Acceptance criteria:

- sample document generates readable TSX
- generated code is deterministic
- unsupported values produce warnings

## Phase 6: CLI and examples

Deliverables:

- `viewfoundry init`
- `viewfoundry export`
- basic example
- dashboard example
- landing page example

Acceptance criteria:

- developer can scaffold a working example
- docs explain integration flow

## Phase 7: LessonKit integration

Deliverables:

- LessonKit component definitions
- LessonKit document adapter
- editor shell integration plan
- LXPack export adapter later

Acceptance criteria:

- a LessonKit lesson can be visually edited using ViewFoundry
- LessonKit-specific schema is preserved
- ViewFoundry remains generic
