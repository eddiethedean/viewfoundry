# Changelog

All notable changes to ViewFoundry packages are documented here. Package versions are lockstep-published under the same semver.

## [0.3.0] — June 2026

### Added

- `NodeLayout` / `GridPlacement` on `ViewNode` for CSS Grid child placement
- `Grid` and `Row` layout components in `examples/basic-react`
- Grid layout validation (bounds, overlap, parent rules) in `@viewfoundry/core`
- `setNodeLayout` command and grid-aware `moveNode` / `insertNode` payloads
- Canvas drag-and-drop via **dnd-kit** — palette ghost, per-cell drop targets, node reposition
- Editor store: `moveNodeToCell`, `nudgeNodeLayout`, grid bootstrap on empty canvas
- Grid reading order in layers panel; arrow-key nudge between cells
- Codegen emits grid placement in wrapper `<div>` elements with `gridColumn` / `gridRow` styles
- `growGridRowsIfNeeded` helper and `isDescendant` tree utility in `@viewfoundry/core`
- Playwright e2e coverage for grid bootstrap and grid container insert

### Changed

- Palette and canvas use dnd-kit instead of native HTML5 drag-and-drop
- `ViewFoundryProvider` accepts optional `wrapEditNode` and `renderGridDropLayer` hooks
- Preview/Live mode wraps grid children in placement elements for WYSIWYG layout fidelity
- Controlled `document` prop sync preserves undo history (`syncDocument`); drag cancel uses `revertDocument`
- Editor toolbar shows `lastError` when mutations are blocked

### Fixed

- `moveNode` no longer silently deletes subtrees when targeting self or a descendant
- Live mode grid placement no longer dropped when components omit a `style` prop
- Codegen no longer emits invalid TSX for `{` in string children
- Full grids auto-grow `rows` instead of failing insert/duplicate silently
- Drag cancel no longer wipes undo/redo history
- `Canvas.canDrop` respects `acceptsChildren`; duplicate selects the new node
- CLI handles malformed JSON and missing files gracefully
- `validateProps` rejects `NaN` and wrong-type values; `validateDocument` checks `acceptsChildren`

## [0.2.0] — 2025

### Added

- `@viewfoundry/editor` Edit / Live single-viewport studio toggle
- Behavioral test coverage across all packages
- `applyCommand` registry-aware command layer in `@viewfoundry/core`
- Codegen input sanitization for identifiers and import paths
- CLI `validate` wired to `validateDocument()`
- Peer dependency ranges across `@viewfoundry/*` packages
- ESLint and Prettier checks in CI

### Fixed

- `EditorProvider` stale `onChange` / `onStudioModeChange` callback capture
- Palette drag-and-drop now uses the same parent resolution as click-to-insert

### Documentation

- Updated `PACKAGE_API_SPEC.md` to match `CommandResult` API
- README documents dual CSS imports and 0.x stability policy
- Stub READMEs for `@viewfoundry/vite` and `@viewfoundry/cli`

## [0.1.0] — 2025

### Added

- Initial monorepo: core, schema, react, editor, codegen, cli, vite
- Document model, commands, history, selection, validation
- Visual editor MVP with palette, canvas, inspector, layers
- TSX codegen and `examples/basic-react`

[0.3.0]: https://github.com/eddiethedean/viewfoundry/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.2.0
[0.1.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.1.0
