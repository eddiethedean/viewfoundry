# Changelog

Package versions are lockstep-published under the same semver. The canonical changelog lives on GitHub: [CHANGELOG.md](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md).

## [0.5.0] — June 2026

CLI scaffolding, Vite document HMR, and new examples. Upgrade all `@viewfoundry/*` packages together.

### Added

- `viewfoundry init` with three templates
- `@viewfoundry/vite` virtual document module and validation overlay
- `examples/landing-page` and `examples/dashboard-builder`

See [Migration from 0.4 → 0.5](migration-0.4-0.5.md). [Full changelog on GitHub →](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md)

## [0.4.1] — June 2026

Bugfix and hardening release. Upgrade all `@viewfoundry/*` packages together.

### Fixed

- Grid `moveNode` auto-grow, partial layout merge, and 64-cell track cap
- Controlled embed sync history, meta-only updates, and stale inbound detection
- Schema `image`/`json` validation; `acceptsChildren` alignment; insert/duplicate prop validation
- Codegen nested grid placement parity with React; CLI `--imports` / `--tokens` / `--strict`
- Editor keyboard/drag guards and unknown-component error feedback

See [Migration from 0.3 → 0.4](migration-0.3-0.4.md) for Style Editor (0.4.0). [Full changelog on GitHub →](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md)

## [0.4.0] — June 2026

### Added

- Style Editor sub-mode: **Component | Style** in the toolbar
- `node.style` (`StyleTokenMap`) separate from component `props`
- Style commands, validation, and grouped Style inspector
- Optional `styleTokens` on provider/editor; codegen inline style emission

### Fixed

- Edit-mode grid placement matches Live preview; demo components forward `style`
- Style validation and command edge cases; editor keyboard/sync/drag/Style inspector polish
- Codegen token warnings and grid key stripping; docs Studio load validation

See [Migration from 0.3 → 0.4](migration-0.3-0.4.md).

## [0.3.0] — June 2026

### Added

- `NodeLayout` / `GridPlacement` on `ViewNode` for CSS Grid child placement
- `Grid` and `Row` layout components in `examples/basic-react`
- Grid layout validation in `@viewfoundry/core`
- `setNodeLayout` command and grid-aware `moveNode` / `insertNode`
- Canvas drag-and-drop via dnd-kit
- Editor store: `moveNodeToCell`, `nudgeNodeLayout`, grid bootstrap on empty canvas
- Codegen emits grid placement in wrapper `<div>` elements with `gridColumn` / `gridRow`
- Playwright e2e coverage for grid bootstrap

### Changed

- Palette and canvas use dnd-kit instead of native HTML5 drag-and-drop
- `ViewFoundryProvider` accepts optional `wrapEditNode` and `renderGridDropLayer`
- Preview/Live mode preserves grid layout via placement wrappers
- Controlled document sync preserves undo history; toolbar shows blocked-action errors

### Fixed

- `moveNode` data loss when moving into self or descendants
- Live mode grid placement when components omit `style`
- Codegen invalid TSX for `{` in text children
- Full-grid insert/duplicate failures; drag cancel wiping history

See [Migration from 0.2 → 0.3](migration-0.2-0.3.md) and the [Grid layout guide](grid-layout.md).

## [0.2.0] — 2025

- Edit / Live single-viewport studio toggle
- `applyCommand` registry-aware command layer
- CLI `validate` and `export`
- Peer dependency ranges across packages

## [0.1.0] — 2025

- Initial SDK: core, schema, react, editor, codegen, example app

[Full changelog on GitHub →](https://github.com/eddiethedean/viewfoundry/blob/main/CHANGELOG.md)
