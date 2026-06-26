# Code Generation Specification

## Goals

Codegen should make ViewFoundry developer credible. It should produce readable TSX from a JSON document and a component import map.

## Inputs

```ts
export type CodegenInput = {
  document: ViewDocument;
  imports: ComponentImportMap;
};

export type ComponentImportMap = Record<string, {
  importPath: string;
  exportName: string;
  defaultImport?: boolean;
}>;
```

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
        }
      }
    ]
  }
}
```

Generated TSX:

```tsx
import { Button } from './components/Button';

export function GeneratedView() {
  return (
    <>
      <Button variant="primary">Click me</Button>
    </>
  );
}
```

## Children prop handling

If `props.children` is a string and the node has no child nodes, render it as JSX children instead of a literal prop when safe.

## Safety rules

- Escape string values.
- Avoid outputting functions from JSON.
- Warn on unsupported values.
- Warn on missing imports.
- Render unknown components as comments or placeholders.

## Formatting

Use Prettier if available. Keep codegen deterministic for tests.
