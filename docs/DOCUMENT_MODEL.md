# ViewFoundry Document Model

## Goals

The document model must be:

- serializable
- stable across versions
- easy to diff
- easy to validate
- renderer-agnostic
- suitable for JSON storage
- suitable for TSX code generation

## Initial model

```ts
export type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: ViewDocumentMeta;
};

export type ViewDocumentMeta = {
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
};
```

## Node identity

Every node must have a stable ID. IDs are used for:

- selection
- history
- drag/drop
- copy/paste
- editor decorations
- comments and collaboration later

Use a small stable ID generator such as `nanoid`.

## Root node

A document should always have exactly one root node.

Recommended default:

```ts
{
  version: '0.1',
  root: {
    id: 'root',
    type: 'Root',
    props: {},
    children: []
  }
}
```

## Children

`children` should initially be a simple ordered array.

Future slot support can extend this to named slots:

```ts
children?: ViewNode[];
slots?: Record<string, ViewNode[]>;
```

Do not implement `slots` in the first MVP unless necessary.

## Props

Props are arbitrary JSON-compatible values but should be validated against registered component prop schemas.

Allowed MVP prop value types:

- string
- number
- boolean
- null
- arrays of JSON-compatible values
- plain objects

Avoid functions in document JSON. For callbacks/actions, use action references later.

## Validation rules

A document is valid when:

1. It has a supported `version`.
2. It has a root node.
3. Every node ID is unique.
4. Every node type exists in the registry, unless missing components are explicitly allowed.
5. Every prop conforms to its field schema.
6. Child constraints are respected.

## Future additions

Potential future fields:

```ts
export type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  slots?: Record<string, ViewNode[]>;
  bindings?: Record<string, DataBinding>;
  conditions?: ConditionExpression[];
  repeat?: RepeatExpression;
  style?: StyleTokenMap;
};
```
