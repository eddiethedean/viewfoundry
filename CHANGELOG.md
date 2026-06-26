# Changelog

All notable changes to ViewFoundry packages are documented here. Package versions are lockstep-published under the same semver.

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

[0.2.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.2.0
[0.1.0]: https://github.com/eddiethedean/viewfoundry/releases/tag/v0.1.0
