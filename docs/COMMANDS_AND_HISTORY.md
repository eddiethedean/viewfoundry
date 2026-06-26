# Commands and History

## Purpose

All editor mutations should flow through commands so undo/redo, validation, collaboration, plugin hooks, and telemetry can be added cleanly.

## Command interface

```ts
export type CommandContext = {
  document: ViewDocument;
  registry: ComponentRegistry;
};

export type CommandResult = {
  document: ViewDocument;
  selection?: SelectionState;
};

export interface ViewCommand<TPayload = unknown> {
  type: string;
  payload: TPayload;
}
```

## MVP commands

- `insertNode`
- `deleteNode`
- `duplicateNode`
- `moveNode`
- `updateProps`
- `setProp`
- `selectNode`
- `clearSelection`

## History model

```ts
export type HistoryState = {
  past: ViewDocument[];
  present: ViewDocument;
  future: ViewDocument[];
};
```

The MVP can store full document snapshots. Later versions can store patches.

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
- Return useful errors for invalid commands.
