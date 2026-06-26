# @viewfoundry/editor

Visual editor UI — palette, canvas, inspector, layers, toolbar, Edit/Live toggle.

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
/>;
```

## Composition API (experimental in 0.x)

`Palette`, `Canvas`, `Inspector`, `LayersPanel`, `Toolbar`, and `createEditorStore` are exported for custom editor shells.

Peer dependencies: `@viewfoundry/core`, `@viewfoundry/react`, `@viewfoundry/schema`, `react`, `react-dom` (all `^0.4.0` for ViewFoundry packages).

The editor includes **Component** and **Style** edit sub-modes (toolbar switcher). Style mode edits `node.style` via `StyleInspector`.
