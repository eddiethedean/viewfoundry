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
- [x] setStyleProp / updateNodeStyle (v0.4.0)
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
- [x] editor store unit tests (insert, delete, undo, studio mode, syncDocument)
- [x] Style sub-mode and style prop mutations (v0.4.0)

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

- `@viewfoundry/vite` plugin tests (v0.5.0) — [x]
- `viewfoundry init` scaffold tests (v0.5.0) — [x]
- Visual regression / layout tests

Grid layout and canvas drag-and-drop are covered by unit tests in `@viewfoundry/core` / `@viewfoundry/editor` and e2e specs (`grid-layout.spec.ts`).

## E2E tests (Playwright)

Browser tests for `examples/basic-react` live in `e2e/`.

| File                       | Focus                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `basic-react.spec.ts`      | Chrome on load, palette insert, Edit/Live, TSX export                               |
| `editor-workflows.spec.ts` | Layers selection, inspector edits, delete/duplicate, undo when history is available |
| `grid-layout.spec.ts`      | Grid containers, palette insert into grid, layer labels                             |

Shared helpers: `e2e/helpers.ts`. Config: `playwright.config.ts` (10s action/expect timeouts).

```bash
pnpm build
pnpm exec playwright install chromium   # first run
pnpm test:e2e
```

Playwright starts `vite preview` for `basic-react` automatically.

Controlled `document` + `onChange` embeds preserve undo via `syncDocument` when updates flow through `onChange`. E2e avoids asserting undo in patterns that replace the document outside `onChange`. See [apps/docs/troubleshooting.md](../apps/docs/troubleshooting.md) and [apps/docs/faq.md](../apps/docs/faq.md).

## UX acceptance testing

Author-facing flows should be exercisable without reading JSON:

- Empty canvas shows a helpful hint
- Palette search and insert update layers and canvas
- Inspector labels match schema metadata (not raw prop keys)
- Edit / Live toggle preserves document; Live hides chrome
- Errors from validation or commands surface readable messages

Before shipping a milestone, use the checklist in [UX_AND_DX.md](UX_AND_DX.md) and manually smoke-test in `examples/basic-react` or the docs Studio embed.

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
