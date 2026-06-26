# @viewfoundry/editor

Visual editor UI — palette, canvas, inspector, layers, toolbar, Edit/Live toggle, Component/Style sub-modes.

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
| `syncDocument(document)`           | Merge external document without clearing undo |
| `setEditSubMode(mode)`             | Switch Component/Style sub-mode               |
| `setStyleProp(nodeId, key, value)` | Set one style key on a node                   |
| `updateStyle(nodeId, style)`       | Merge style keys on a node                    |
| `updateStyle(nodeId, partial)`     | Merge style keys on a node                    |

Style mutations flow through `@viewfoundry/core` commands (`setStyleProp`, `updateNodeStyle`).

Peer dependencies: `@viewfoundry/core`, `@viewfoundry/react`, `@viewfoundry/schema`, `react`, `react-dom` (all `^0.4.1` for ViewFoundry packages).

Full API contract: [`specs/PACKAGE_API_SPEC.md`](https://github.com/eddiethedean/viewfoundry/blob/main/specs/PACKAGE_API_SPEC.md).

## Related

- [Editor keyboard shortcuts](../editor-shortcuts.md)
- [Component registration](../component-registration.md)
