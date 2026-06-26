# Migration from 0.3 → 0.4

ViewFoundry **0.4.0** adds the Style Editor sub-mode and a `style` field on `ViewNode`. Existing documents without `style` continue to work unchanged.

## Install

Upgrade all packages together:

```bash
npm install @viewfoundry/core@0.4.0 @viewfoundry/schema@0.4.0 @viewfoundry/react@0.4.0 @viewfoundry/editor@0.4.0 @viewfoundry/codegen@0.4.0
```

## Document model

Nodes may now include optional presentation styles separate from schema-backed `props`:

```json
{
  "id": "btn1",
  "type": "Button",
  "props": { "children": "Click me" },
  "style": {
    "margin": 8,
    "backgroundColor": "#3182ce"
  }
}
```

- `style` stores JSON-serializable CSS values (strings or numbers).
- Token references (e.g. `"color.primary"`) resolve via host-provided maps.
- `props.style` and `node.style` merge at render time; **`node.style` wins** on conflict.

## Editor

- Toolbar in Edit mode: **Component | Style** sub-modes (Interactions ships in v0.8).
- Style mode hides the palette; layers panel remains for selection.
- Style edits share undo/redo history with structure edits.
- Selection is preserved when switching sub-modes and when undoing style changes.

## Runtime

Pass optional design-token presets to the provider and editor:

```tsx
<ViewFoundryProvider
  document={document}
  registry={registry}
  styleTokens={{
    'color.primary': '#3182ce',
    'spacing.md': 16,
  }}
>
  <ViewRenderer />
</ViewFoundryProvider>
```

## Codegen

`generateTsx` emits merged inline `style={{ ... }}` on components from `node.style` (and existing `props.style`). Pass the same `styleTokens` map to resolve token references to literals:

```ts
generateTsx({ document, imports, styleTokens });
```

Grid placement wrappers are unchanged — only `gridColumn` / `gridRow` on the wrapper `<div>`.

## Validation

`validateDocument()` validates `node.style` values when present (colors, opacity, enums for layout properties, etc.).

## See also

- [Changelog](changelog.md)
- [Getting started](getting-started.md)
