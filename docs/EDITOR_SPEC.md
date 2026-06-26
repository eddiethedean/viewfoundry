# Editor Specification

## MVP editor layout

```txt
┌───────────────────────────────────────────────┐
│ Toolbar                                       │
├──────────────┬─────────────────┬──────────────┤
│ Palette      │ Canvas          │ Inspector    │
│              │                 │              │
├──────────────┴─────────────────┴──────────────┤
│ Optional status bar                            │
└───────────────────────────────────────────────┘
```

## Required panels

### Palette

Shows registered components grouped by category.

Features:

- search/filter
- drag component to canvas
- click to insert selected component into root or selected container

### Canvas

Renders the current document with editor overlays.

Features:

- select node
- show selected outline
- show hover outline
- support drop targets
- empty state

### Layers panel

Can be MVP or Phase 2, but should be added early.

Features:

- tree view
- select node
- reorder nodes later
- delete node later

### Inspector

Generated from the selected component's prop schema.

Features:

- edit text/number/boolean/select/color/url/json
- update document on change
- show selected node type/id
- show missing schema warning

### Toolbar

Features:

- undo
- redo
- delete
- duplicate
- save/export hooks
- preview/edit mode toggle later

## Keyboard shortcuts

MVP shortcuts:

- Delete/Backspace: delete selected node
- Cmd/Ctrl+Z: undo
- Cmd/Ctrl+Shift+Z: redo
- Cmd/Ctrl+C: copy selected node
- Cmd/Ctrl+V: paste node
- Escape: clear selection

## Styling guidance

Use clean, neutral styling. Avoid coupling to a specific design system. The editor should be skinnable later.

## Accessibility

Editor controls should be keyboard accessible. The generated content itself may not always be accessible, but editor chrome should be.
