# Changelog

All notable changes to ViewFoundry packages are documented here. Package versions are lockstep-published under the same semver.

## [Unreleased]

### Fixed

- Vite plugin path containment for document reads and codegen output; HMR soft-fails on invalid JSON while serving the last valid document
- Init template `{{ VERSION }}` token replacement; CLI help uses package version dynamically
- `syncDocument` validates inbound documents; version-only external updates no longer reset editor history
- `resetDocument` in examples uses HMR-updated seed via ref after document file edits
- Codegen rejects JS reserved words as export names and absolute import paths
- Core commands: grid auto-placement on insert, same-parent move index adjustment, grid reorder after delete, layout cleared on duplicate to non-grid parents
- Grid move/nudge guard failures surface `lastError` in the editor store
- Grid validation rejects containers exceeding 64 tracks

### Changed

- CLI errors on unknown flags; `--imports` and `--tokens` require values
- CI fails when CLI templates drift from examples (`pnpm sync:templates`)

## [0.5.0] — June 2026

### Added

- **`viewfoundry init`** — scaffold Vite + React projects from `default`, `landing-page`, and `dashboard-builder` templates
- **`@viewfoundry/vite`** — `virtual:viewfoundry/document` module, document validation overlay, dev HMR, optional codegen watch
- **`examples/landing-page`** and **`examples/dashboard-builder`** with seeded grid layouts
- **`scripts/sync-cli-templates.mjs`** — keeps CLI templates in sync with examples
- Unit tests for vite plugin and init command

### Changed

- **`examples/basic-react`** — file-based `viewfoundry/document.json` with Vite plugin; localStorage remains optional persistence
- Integration docs updated for init path and Vite document workflow

## [0.4.1] — June 2026

### Added

- `MAX_GRID_CELLS` (64) export and grid track cap in `@viewfoundry/core`
- CLI `export` flags: `--imports`, `--tokens`, and `--strict`
- `examples/basic-react` banner when saved localStorage document fails validation
- Expanded unit and Playwright e2e coverage (redo, nested grid codegen, CLI export, invalid storage)

### Changed

- External tree sync via `syncDocument` pushes the current document onto the undo stack before replacing it; meta-only parent updates sync without resetting history
- Codegen folds grid placement into nested grid container `style` (matches React runtime); emits explicit `false` boolean props
- `validateDocument` rejects children when `acceptsChildren` is not truthy (aligned with `applyCommand`)
- `applyCommand` validates node props on `insertNode` and `duplicateNode` when `validateNodeProps` is wired

### Fixed

- `moveNode` auto-grows target grid rows/columns for cross-container drops
- Partial `setNodeLayout` / `insertNode` layout merges preserve spans when growing grids
- Controlled embed meta-only updates no longer blocked in `EditorContext`
- `isStaleInboundDocument` narrowed to immediate prior snapshot (allows intentional revert to older saves)
- Schema validation for `image` and `json` field kinds; invalid regex issue paths
- CLI path traversal guard; keyboard shortcuts disabled during drag; unknown palette types set `lastError`

## [0.4.0] — June 2026

### Added

- **Style Editor** sub-mode (Edit only): toolbar **Component | Style** switcher
- `style?: StyleTokenMap` on `ViewNode` for presentation separate from `props`
- Style commands: `setStyleProp`, `updateNodeStyle` with shared undo/redo
- `StyleInspector` with grouped controls (spacing, colors, typography, border, layout, opacity)
- `validateStyle()` and document validation for style values
- `@viewfoundry/schema` style field metadata (`STYLE_FIELD_DEFS`, `getStyleFieldsByGroup`)
- `styleTokens` on `ViewFoundryProvider` and `ViewFoundryEditor` for optional design presets
- `resolveStyleMap()` in `@viewfoundry/react`; codegen emits merged inline `style` props
- Playwright e2e coverage for Style sub-mode editing and undo

### Changed

- Undo/redo preserves selection when the selected node still exists in the restored document
- Style mode hides the component palette; layers panel remains for selection
- `syncDocument` clears the redo stack on external document replacement (controlled embed contract; tree sync undo push in **0.4.1**)

### Fixed

- Edit-mode grid placement WYSIWYG — `gridColumn`/`gridRow` apply on the drag shell, matching Live/preview layout
- Demo components (`Card`, `Stack`, `Heading`, `Text`) forward `style` so Style edits render on canvas
- Style validation accepts `fontWeight` keywords, `lineHeight: normal`, and border shorthand; custom keys validated loosely
- `setStyleProp` treats `null` as removal; `updateNodeStyle` strips `undefined`/`null` after merge
- Undo/redo no longer fires when focus is in Style inspector inputs (Ctrl+Y redo on Windows)
- Drag-drop preserves `colSpan`/`rowSpan`; Style inspector debounces commits and avoids token color overwrite
- Codegen warns on unresolved style tokens; strips grid placement keys from component `style` when using wrapper divs
- Docs Studio validates saved documents on load (matches `examples/basic-react`)

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

[0.5.0]: https://github.com/eddiethedean/viewfoundry/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/eddiethedean/viewfoundry/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/eddiethedean/viewfoundry/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/eddiethedean/viewfoundry/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.2.0
[0.1.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.1.0
