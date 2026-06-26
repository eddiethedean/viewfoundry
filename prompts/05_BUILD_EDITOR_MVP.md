# Cursor Prompt: Build @viewfoundry/editor MVP

Implement the initial visual editor package according to:

- `docs/EDITOR_SPEC.md`
- `docs/COMMANDS_AND_HISTORY.md`
- `docs/PROP_SCHEMA.md`

Build:

- `ViewFoundryEditor`
- editor shell layout
- toolbar
- component palette
- canvas
- inspector
- simple layers panel if practical

Features required:

- render initial document
- select nodes on canvas
- insert components from palette
- edit props in inspector
- delete selected node
- duplicate selected node
- undo/redo
- emit `onChange(document)`

Use generated inspector controls from prop schemas.

Keep drag/drop simple for the first pass. Click-to-insert is acceptable before full drag/drop if needed.

Acceptance criteria:

- a user can build and edit a small component tree
- props update live
- undo/redo works
- editor builds cleanly
