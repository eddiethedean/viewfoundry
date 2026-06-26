# Commands and History

## Purpose

All editor mutations should flow through commands so undo/redo, validation, collaboration, plugin hooks, and telemetry can be added cleanly.

## Command interface

```ts
export type CommandContext = {
  document: ViewDocument;
  registry: ComponentRegistry;
};

export type CommandResult<T = void> =
  | { ok: true; document: ViewDocument; data?: T }
  | { ok: false; error: string };

export interface ViewCommand<TPayload = unknown> {
  type: string;
  payload: TPayload;
}
```

Always check `result.ok` before using `result.document`. Failed commands return `{ ok: false, error: string }` without mutating the input document.

## Registry-aware layer

Prefer `applyCommand(document, command, registry)` for editor integrations. It dispatches to low-level command functions, runs validation, and returns `CommandResult`.

## Commands (current)

| Command           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `insertNode`      | Add a child under `parentId`; optional `layout` for grid placement |
| `deleteNode`      | Remove a node by `nodeId`                                          |
| `duplicateNode`   | Clone a subtree                                                    |
| `moveNode`        | Change parent/index; optional `layout` for grid placement          |
| `setNodeLayout`   | Update `layout.grid` on a node                                     |
| `updateNodeProps` | Replace props object on a node                                     |
| `setNodeProp`     | Set a single prop key on a node                                    |

Selection helpers (`selectNode`, `clearSelection`) are handled in the editor store rather than document commands in the current implementation.

## History model

```ts
export type HistoryState = {
  past: ViewDocument[];
  present: ViewDocument;
  future: ViewDocument[];
};
```

The MVP stores full document snapshots. Later versions can store patches.

## Undo/redo API

```ts
undo(): void;
redo(): void;
canUndo(): boolean;
canRedo(): boolean;
```

## Implementation guidance

- Use immutable updates.
- Keep command functions pure where possible.
- Never mutate the existing document object in place.
- Validate node existence before mutation.
- Return `{ ok: false, error }` for invalid commands rather than throwing.

## Grid-related payloads (v0.3.0)

```ts
type MoveNodePayload = {
  nodeId: string;
  parentId: string;
  index: number;
  layout?: GridPlacement;
};

type SetNodeLayoutPayload = {
  nodeId: string;
  layout: GridPlacement;
};
```

Undo/redo restores grid placement together with tree structure.

## Future commands (planned)

| Command             | Release | Purpose                                  |
| ------------------- | ------- | ---------------------------------------- |
| `addInteraction`    | v0.8.0  | Add document-level trigger → action rule |
| `updateInteraction` | v0.8.0  | Edit trigger, actions, or conditions     |
| `removeInteraction` | v0.8.0  | Delete interaction by id                 |
| `addRoute`          | v0.9.0  | Add route to site                        |
| `updateRoute`       | v0.9.0  | Change path, label, or meta              |
| `removeRoute`       | v0.9.0  | Delete route by id                       |

See [INTERACTIONS.md](INTERACTIONS.md) and [ROUTING.md](ROUTING.md).
