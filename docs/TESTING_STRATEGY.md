# Testing Strategy

## Principles

- Prefer **behavior** over existence checks: assert outputs, state changes, and error messages.
- Cover **failure paths** for public APIs, not only happy paths.
- Assert **immutability** for pure document/command functions.
- Test **public interfaces** (provider props, toolbar actions, CLI commands) over private internals.
- Shared editor fixtures live in [`packages/editor/src/test/fixtures.tsx`](../packages/editor/src/test/fixtures.tsx).

## Core package tests

- [x] document creation
- [x] node traversal and tree helpers
- [x] insert / delete / duplicate / move / update props
- [x] command failure paths and immutability
- [x] selection helpers
- [x] undo / redo integrated with commands
- [x] validation (version, root, duplicate ids, unknown types, child rules, allowMissingComponents)
- [x] registry behavior

Files: `packages/core/src/*.test.ts`

## Schema package tests

- [x] field builders
- [x] default values and skipped defaults
- [x] required, select, min/max, and pattern validation
- [x] `defineComponent` default merging and overrides

File: `packages/schema/src/schema.test.ts`

## React runtime tests

- [x] document renders component tree
- [x] props are passed correctly
- [x] children render recursively
- [x] missing components render fallback
- [x] preview/live mode renders without editor wrappers
- [x] edit mode selection and `onSelectNode`
- [x] provider hooks and missing-provider guard

File: `packages/react/src/react.test.tsx`

## Editor tests

- [x] Edit / Live studio mode toggle and chrome visibility
- [x] Live interactivity without editor wrappers
- [x] palette inserts registered components
- [x] layer selection shows inspector
- [x] inspector prop edits update document
- [x] undo / redo toolbar actions
- [x] delete and duplicate toolbar actions
- [x] keyboard undo shortcut
- [x] `onStudioModeChange` callback
- [x] editor store unit tests (insert, delete, undo, studio mode)

Files: `packages/editor/src/editor.test.tsx`, `packages/editor/src/store.test.ts`

## Codegen tests

- [x] TSX output for simple and nested trees
- [x] string children and boolean shorthand props
- [x] escaping for props and JSX text
- [x] imports and default imports
- [x] missing import warnings and unsupported values
- [x] fragment wrapping and self-closing tags
- [x] `generateJson` round-trip

File: `packages/codegen/src/codegen.test.ts`

## CLI tests

- [x] `export` writes TSX from JSON
- [x] `export` errors without input path
- [x] `validate` succeeds and fails appropriately
- [x] help and unknown command handling

File: `packages/cli/src/cli.test.ts`

## Future coverage (deferred)

- Canvas drag-and-drop insert (v0.3.0 grid)
- Playwright e2e for `examples/basic-react`
- `@viewfoundry/vite` plugin tests (v0.5.0)
- Visual regression / layout tests

## CI commands

```bash
pnpm typecheck
pnpm test
pnpm build
```

Or the full gate:

```bash
pnpm check
```
