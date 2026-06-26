# @viewfoundry/react

React runtime for ViewFoundry documents.

## Exports

- `ViewFoundryProvider` — context for document, registry, selection, mode
- `ViewRenderer` — renders the document tree
- `ViewNodeRenderer` — single-node renderer
- Hooks: `useViewDocument`, `useViewRegistry`, `useViewSelection`

## Example

```jsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';

<ViewFoundryProvider document={document} registry={registry} mode="preview">
  <ViewRenderer />
</ViewFoundryProvider>;
```

Use `mode="edit"` when embedding selection overlays without the full editor chrome.

Peer dependencies: `@viewfoundry/core@^0.4.0`, `react`, `react-dom`.
