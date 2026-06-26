# @viewfoundry/react

React runtime for ViewFoundry documents — provider, renderer, hooks, style resolution.

## Exports

| Export                | Description                                       |
| --------------------- | ------------------------------------------------- |
| `ViewFoundryProvider` | Context for document, registry, selection, mode   |
| `ViewRenderer`        | Renders the document tree                         |
| `ViewNodeRenderer`    | Single-node renderer                              |
| `resolveStyleMap`     | Resolves `node.style` + tokens to `CSSProperties` |
| `useViewDocument`     | Current document from context                     |
| `useViewRegistry`     | Registry from context                             |
| `useViewSelection`    | Selection state from context                      |

Styles: `@viewfoundry/react/styles.css` (selection overlays, missing-component fallback).

## `ViewFoundryProvider` props

| Prop                  | Type                                   | Default     | Description                     |
| --------------------- | -------------------------------------- | ----------- | ------------------------------- |
| `document`            | `ViewDocument`                         | required    | Document to render              |
| `registry`            | `ComponentRegistry`                    | required    | Component registry              |
| `selection`           | `SelectionState`                       | empty       | Selected node ids               |
| `mode`                | `'preview' \| 'edit'`                  | `'preview'` | Preview vs edit overlays        |
| `styleTokens`         | `Record<string, string \| number>`     | —           | Token map for style resolution  |
| `onSelectNode`        | `(nodeId: string \| null) => void`     | —           | Selection callback in edit mode |
| `wrapEditNode`        | `(node, element, parent) => ReactNode` | —           | Custom edit wrapper             |
| `renderGridDropLayer` | `(node) => ReactNode`                  | —           | Grid drop overlay hook          |
| `children`            | `ReactNode`                            | required    | Subtree                         |

## `ViewRenderer` props

| Prop       | Type           | Default | Description                     |
| ---------- | -------------- | ------- | ------------------------------- |
| `document` | `ViewDocument` | context | Override document from provider |

`ViewRenderer` must be rendered inside `ViewFoundryProvider` — the provider supplies registry, mode, and selection even when you pass `document` explicitly.

## Example

```jsx
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import '@viewfoundry/react/styles.css';

<ViewFoundryProvider
  document={document}
  registry={registry}
  mode="preview"
  styleTokens={styleTokens}
>
  <ViewRenderer />
</ViewFoundryProvider>;
```

Use `mode="edit"` when embedding selection overlays without the full editor chrome.

Peer dependencies: `@viewfoundry/core@^0.4.1`, `react`, `react-dom`.

Full API contract: [`specs/PACKAGE_API_SPEC.md`](https://github.com/eddiethedean/viewfoundry/blob/main/specs/PACKAGE_API_SPEC.md).
