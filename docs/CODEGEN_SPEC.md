# Code Generation Specification

## Goals

Codegen should make ViewFoundry developer credible. It should produce readable TSX from a JSON document and a component import map.

## Inputs

```ts
export type CodegenInput = {
  document: ViewDocument;
  imports: ComponentImportMap;
  componentName?: string;
  styleTokens?: Record<string, string | number>;
};

export type ComponentImportMap = Record<
  string,
  {
    importPath: string;
    exportName: string;
    defaultImport?: boolean;
  }
>;
```

`styleTokens` resolves token references in `node.style` at export time (same map as `ViewFoundryEditor` / `ViewFoundryProvider`).

## Output

```ts
export type CodegenOutput = {
  code: string;
  warnings: string[];
};
```

## Example

Input document:

```json
{
  "version": "0.1",
  "root": {
    "id": "root",
    "type": "Root",
    "children": [
      {
        "id": "btn1",
        "type": "Button",
        "props": {
          "variant": "primary",
          "children": "Click me"
        },
        "style": {
          "margin": 8
        }
      }
    ]
  }
}
```

Generated TSX (simplified):

```tsx
import { Button } from './components/Button';

export function GeneratedView() {
  return (
    <>
      <Button variant="primary" style={{ margin: 8 }}>
        Click me
      </Button>
    </>
  );
}
```

## Children prop handling

If `props.children` is a string and the node has no child nodes, render it as JSX children instead of a literal prop when safe.

## Style output (v0.4.0)

- Merged `style={{...}}` from `node.style` and `props.style` when present.
- Token references resolved when `styleTokens` is provided.
- Grid placement may wrap nodes in a layout `div` (see grid codegen in implementation).

## Safety rules

- Escape string values.
- Avoid outputting functions from JSON.
- Warn on unsupported values.
- Warn on missing imports.
- Render unknown components as comments or placeholders.

## Formatting

Use Prettier if available. Keep codegen deterministic for tests.
