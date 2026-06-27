# @viewfoundry/editor

Visual editor UI — palette/canvas/inspector today; **Stage**, **Elements**, **Add Elements**, code-first DnD from v0.7. See [Roadmap & direction](../roadmap-and-direction.md).

## Primary export

```jsx
import { ViewFoundryEditor } from '@viewfoundry/editor';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';

<ViewFoundryEditor
  registry={registry}
  document={document}
  onChange={setDocument}
  onExport={handleExport}
  styleTokens={styleTokens}
/>;
```

Import **both** stylesheets. See [Getting started](../getting-started.md).

## `ViewFoundryEditor` props

| Prop                 | Type                               | Default  | Description                                     |
| -------------------- | ---------------------------------- | -------- | ----------------------------------------------- |
| `registry`           | `ComponentRegistry`                | required | Registered component definitions                |
| `document`           | `ViewDocument`                     | —        | Controlled document; omit for uncontrolled mode |
| `onChange`           | `(document: ViewDocument) => void` | —        | Called after each successful edit               |
| `onExport`           | `() => void`                       | —        | Toolbar export button callback                  |
| `className`          | `string`                           | —        | Root element class                              |
| `defaultStudioMode`  | `'edit' \| 'live'`                 | `'edit'` | Initial Edit/Live mode                          |
| `onStudioModeChange` | `(mode: StudioMode) => void`       | —        | Edit/Live toggle callback                       |
| `styleTokens`        | `Record<string, string \| number>` | —        | Token presets for Style Inspector and runtime   |

Controlled `document` + `onChange` preserves undo via `syncDocument`. See [Troubleshooting](../troubleshooting.md#undo-and-redo-with-controlled-document).

## Errors and `syncDocument`

The editor store exposes `lastError: string | null`. When an action is blocked (unknown palette type, invalid grid move, out-of-bounds nudge, etc.), the store sets `lastError` and **does not** mutate the document.

`ViewFoundryEditor` shows `lastError` in the Edit-mode toolbar as a non-blocking banner. Custom shells using `createEditorStore` should read `lastError` from `useEditorState` and surface it similarly.

`syncDocument(document)` merges an external controlled document without clearing undo:

- **No tree change** — updates `version` / `meta` only; history unchanged.
- **Tree change** — validates with `validateDocument` (`allowMissingComponents: false`). Invalid inbound documents are **rejected**; the current document and history stay intact and `lastError` receives the first validation message.
- **Valid tree change** — pushes the previous present onto the undo stack, replaces the document, clears redo, and preserves selection when the selected node still exists.

Successful edits clear `lastError`. See [Production patterns](../production-patterns.md#persistence) for API-backed persistence patterns.

## Composition API (experimental in 0.x)

| Export                  | Purpose                          |
| ----------------------- | -------------------------------- |
| `Palette`               | Component palette                |
| `Canvas`                | Document canvas                  |
| `Inspector`             | Schema-backed prop inspector     |
| `StyleInspector`        | Style sub-mode inspector         |
| `LayersPanel`           | Layer tree                       |
| `Toolbar`               | Edit/Live and sub-mode controls  |
| `EditorProvider`        | Store context wrapper            |
| `createEditorStore`     | Headless store for custom shells |
| `useEditorStore`        | Imperative store API             |
| `useEditorState`        | Zustand-style selector hook      |
| `resolveInsertParentId` | Grid-aware insert target helper  |

`EditSubMode`: `'component' | 'style'`.

## Editor store (selected methods)

When using `createEditorStore` or `useEditorStore`:

| Method                             | Description                                   |
| ---------------------------------- | --------------------------------------------- |
| `undo()` / `redo()`                | History navigation                            |
| `canUndo()` / `canRedo()`          | History availability                          |
| `syncDocument(document)`           | Merge external document; rejects invalid JSON |
| `moveNodeToCell(nodeId, cell)`     | Move a grid child to another cell             |
| `nudgeNodeLayout(nodeId, dx, dy)`  | Arrow-key grid nudge                          |
| `setEditSubMode(mode)`             | Switch Component/Style sub-mode               |
| `setStyleProp(nodeId, key, value)` | Set one style key on a node                   |
| `updateStyle(nodeId, partial)`     | Merge style keys on a node                    |

Store state includes `lastError` — see [Errors and syncDocument](#errors-and-syncdocument) above.

Style mutations flow through `@viewfoundry/core` commands (`setStyleProp`, `updateNodeStyle`).

Peer dependencies: `@viewfoundry/core`, `@viewfoundry/react`, `@viewfoundry/schema`, `react`, `react-dom` (all `^0.5.0` for ViewFoundry packages).

Full API reference: [Package API spec](../package-api-spec.md#viewfoundryeditor).

## Related

- [Editor keyboard shortcuts](../editor-shortcuts.md)
- [Component registration](../component-registration.md)
