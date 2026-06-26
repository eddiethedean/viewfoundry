# Editor keyboard shortcuts and modes

ViewFoundry's editor supports keyboard shortcuts in **Edit** mode. Shortcuts are disabled in **Live** mode and while focus is inside a text input (inspector fields, palette search).

## Edit / Live toggle

Use the toolbar **Edit | Live** switch:

| Mode     | Behavior                                                                                  |
| -------- | ----------------------------------------------------------------------------------------- |
| **Edit** | Palette, layers, inspector, and canvas overlays visible. Mutations and shortcuts enabled. |
| **Live** | Chrome hidden; same document rendered interactively. No editor mutations or shortcuts.    |

Undo/redo history is shared across Edit and Live — switching modes does not clear history.

## Edit sub-modes (Edit only)

When Edit is active, use **Component | Style** in the toolbar:

| Sub-mode      | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| **Component** | Structure, nesting, schema-backed props, grid drag-and-drop   |
| **Style**     | Visual styling via `node.style` (spacing, colors, typography) |

Selection is preserved when switching sub-modes.

## Keyboard shortcuts

| Shortcut                           | Action                                    |
| ---------------------------------- | ----------------------------------------- |
| `Delete` / `Backspace`             | Delete selected node                      |
| `Cmd/Ctrl+Z`                       | Undo                                      |
| `Cmd/Ctrl+Shift+Z` or `Cmd/Ctrl+Y` | Redo                                      |
| `Cmd/Ctrl+D`                       | Duplicate selected node                   |
| Arrow keys                         | Nudge grid placement (grid children only) |
| `Escape`                           | Clear selection; cancel in-progress drag  |

Clipboard copy/paste shortcuts are planned for a future release — see the [roadmap](https://github.com/eddiethedean/viewfoundry/blob/main/docs/CLIPBOARD_AND_BLOCKS.md).

Shortcuts do not fire when typing in an input, textarea, or contenteditable field.

## Undo and controlled documents

When you use `document` + `onChange`, undo history is preserved for edits that flow through `onChange`. Loading an external document (server, reset) clears the redo stack. See [Troubleshooting](troubleshooting.md#undo-and-redo-with-controlled-document).

## Grid editing

- Drag from the **palette** onto grid cells to insert with placement.
- Drag existing nodes between cells to reposition.
- Use **arrow keys** to nudge the selected node within its grid parent (see [Keyboard shortcuts](#keyboard-shortcuts)).
- Use the **Layers** panel when pointer hit-testing makes canvas selection unreliable.

See [Grid layout](grid-layout.md).

## Related

- [Getting started](getting-started.md)
- [FAQ](faq.md)
- [Troubleshooting](troubleshooting.md)
