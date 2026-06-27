# Commands and History

> **Dual mode:** Embed mode uses document commands (below). Code-first (**v0.7+**) adds **file-level** history via `@viewfoundry/sync`. See [CODE_FIRST.md](CODE_FIRST.md).

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
| `setStyleProp`    | Set or remove one key on `node.style` (**v0.4.0**)                 |
| `updateNodeStyle` | Merge partial style object on a node (**v0.4.0**)                  |

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

Undo/redo restores grid placement and style together with tree structure.

## Style payloads (v0.4.0)

```ts
type SetStylePropPayload = {
  nodeId: string;
  key: string;
  value: StyleValue | null; // null removes the key
};

type UpdateNodeStylePayload = {
  nodeId: string;
  style: Partial<StyleTokenMap>;
};
```

Style commands validate keys via `@viewfoundry/schema` (`validateStyleProp`). Use `applyCommand(document, { type: 'setStyleProp', payload }, registry)` for registry-aware dispatch.

## Future commands (planned)

| Command / area         | Release | Purpose                                      |
| ---------------------- | ------- | -------------------------------------------- |
| TSX interaction wiring | v0.11.0 | Code-first handler edits (not JSON commands) |
| Route/page edits       | v0.10.0 | Code-first routing in source                 |
| Embed `addInteraction` | backlog | JSON interactions for CMS embeds only        |

See [INTERACTIONS.md](INTERACTIONS.md), [ROUTING.md](ROUTING.md), [CODE_FIRST.md](CODE_FIRST.md).

## File-edit commands (v0.7.0, code-first)

Code-first editing uses **file snapshots** instead of `ViewDocument`. Patches are applied via `@viewfoundry/sync`; the editor store calls these when you edit structure or props on the Stage.

```ts
export type FileCommandResult =
  | { ok: true; patches: FilePatch[] }
  | { ok: false; error: string };

export type FileHistoryState = {
  past: Record<string, string>[];
  present: Record<string, string>;
  future: Record<string, string>[];
};
```

| Command              | Sync function        | Description                              |
| -------------------- | -------------------- | ---------------------------------------- |
| `insertJsxElement`   | `patchInsertElement` | Insert JSX under a parent element        |
| `deleteJsxElement`   | `patchDeleteElement` | Remove a JSX element                     |
| `moveJsxElement`     | `patchMoveElement`   | Reparent or reorder JSX children         |
| `updateJsxProp`      | `patchSetProp`       | Set or replace a JSX attribute           |
| `reorderJsxChildren` | `patchMoveElement`   | Reorder siblings (via move, v0.7)      |

File undo/redo uses `createFileHistory`, `pushFileHistory`, `undoFileHistory`, and `redoFileHistory` from `@viewfoundry/core` (re-exported by `@viewfoundry/sync`).

Embed `DocumentCommand` types are **frozen** — do not extend them for code-first features.
