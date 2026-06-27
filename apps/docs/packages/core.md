# @viewfoundry/core

Framework-agnostic document engine (**embed mode**, shipped). Planned **v0.7+:** file-edit command types for `@viewfoundry/sync`. See [Roadmap & direction](../roadmap-and-direction.md).

## Responsibilities

- `ViewDocument` and `ViewNode` types
- Component registry (`createRegistry`)
- Commands (`insertNode`, `deleteNode`, `moveNode`, …) returning `CommandResult`
- Registry-aware `applyCommand`
- History (`undo` / `redo`) and selection helpers
- `validateDocument`

## Example

```ts
import { createDocument, createRegistry, applyCommand, createNode } from '@viewfoundry/core';

const registry = createRegistry(definitions);
const document = createDocument();
const node = createNode('Button', { children: 'Click me' });

const result = applyCommand(
  document,
  { type: 'insertNode', payload: { parentId: 'root', node } },
  registry,
);
```

No React dependency. Safe to use on the server for validation and transforms.

Full API reference: [Package API spec](../package-api-spec.md#viewfoundrycore).
