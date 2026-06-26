# Interactions & Triggers

## Purpose

ViewFoundry documents today describe **structure** (tree), **props** (component data), **layout** (grid), and (planned) **style**. They do not yet describe **behavior** — what happens when a user clicks a button, submits a form, or when one component should update another.

This spec plans a JSON-serializable **interaction model**: triggers, actions, and targets wired between registered components — editable in the studio and executable in Live mode without storing functions in the document.

## Goals

- Connect components with declarative triggers and actions (no functions in JSON).
- Work in **Live mode** and in exported/host apps via a small runtime interpreter.
- Integrate with the command/history system so wiring edits undo/redo cleanly.
- Stay registry-aware: only events and actions declared by host apps or built-ins are valid.
- Codegen can emit readable handler wiring or delegate to a runtime helper.

## Non-goals (initial release)

- Arbitrary JavaScript expressions in the document.
- Full state-machine or visual scripting language.
- Server-side or async workflow orchestration.
- Full **multi-route URL routing** — v0.8 ships `navigate` against a host callback; declarative site routing is **v0.9.0** (see [ROUTING.md](ROUTING.md)).

## Concepts

| Term            | Meaning                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Trigger**     | An event on a **source** node that starts an interaction (`click`, `change`, `submit`, …).                    |
| **Action**      | An effect applied to a **target** node or document state (`setProp`, `toggleVisibility`, `navigate`, …).      |
| **Interaction** | One trigger plus one or more actions (and optional conditions).                                               |
| **Binding**     | (Related, later) continuous data link from a source value to a target prop — distinct from one-shot triggers. |

Triggers are **episodic** (fire on event). Bindings are **continuous** (keep props in sync). Both may share expression/condition syntax later.

## Document model (planned v0.8.0)

Interactions live on the **document** so cross-node wiring is first-class and easy to list in an Interactions panel:

```ts
export type InteractionTrigger = {
  /** Registry-defined or built-in event id, e.g. 'click', 'change', 'submit' */
  event: string;
  /** Node that emits the event */
  sourceNodeId: string;
};

export type InteractionAction = {
  /** Built-in or registry-defined action id */
  type: string;
  /** Node receiving the effect; omitted for document-level actions */
  targetNodeId?: string;
  /** Action-specific payload (prop key/value, route path, etc.) */
  payload?: Record<string, unknown>;
};

export type Interaction = {
  id: string;
  label?: string;
  trigger: InteractionTrigger;
  actions: InteractionAction[];
  /** Optional guard — all must pass before actions run */
  conditions?: ConditionExpression[];
  enabled?: boolean;
};

export type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: ViewDocumentMeta;
  interactions?: Interaction[];
};
```

Node-level `bindings` and `conditions` on `ViewNode` remain separate future fields (see `docs/DOCUMENT_MODEL.md`). Interactions reference nodes by **stable id**.

### Example

A button click sets a heading’s text:

```json
{
  "interactions": [
    {
      "id": "ix1",
      "label": "Button → Heading text",
      "trigger": { "event": "click", "sourceNodeId": "btn1" },
      "actions": [
        {
          "type": "setProp",
          "targetNodeId": "heading1",
          "payload": { "key": "children", "value": "Clicked!" }
        }
      ]
    }
  ]
}
```

## Registry surface

Component definitions gain optional **event** and **action** metadata (similar to prop schemas):

```ts
export type ComponentEvent = {
  id: string;
  label: string;
  description?: string;
};

export type ComponentAction = {
  id: string;
  label: string;
  /** JSON schema for payload fields shown in the interaction editor */
  payloadSchema?: Record<string, PropField>;
};

export type ComponentDefinition = {
  type: string;
  // ...existing fields
  events?: ComponentEvent[];
  actions?: ComponentAction[];
};
```

Built-in events (MVP): `click`, `change`, `submit`, `focus`, `blur`.  
Built-in actions (MVP): `setProp`, `toggleVisibility`, `scrollToNode`, `openUrl`, `navigate` (route id/path — requires [routing](ROUTING.md) runtime in v0.9.0; host callback in v0.8).  
Host apps register custom events/actions on components (e.g. `onLessonComplete`).

## Runtime (planned `@viewfoundry/react`)

1. **Live mode** — `ViewFoundryProvider` attaches trigger listeners to rendered nodes (via wrapper or synthetic props).
2. On trigger — evaluate conditions, resolve targets, run actions in order.
3. **Document updates** from `setProp` / visibility actions flow through the same immutable document rules as the editor (host may persist via `onChange`).
4. **Edit mode** — triggers are disabled or no-op so wiring does not fire while dragging.

Optional `useInteractions(document, registry)` hook for runtime-only apps.

## Editor (planned v0.8.0)

### Interactions sub-mode

Toolbar in Edit mode: **Component | Style | Interactions** (Interactions ships after Style Editor in **v0.4.0**).

### Interactions panel

- List all interactions in the document (filter by source/target node).
- Add interaction: pick source node → pick trigger event → add one or more actions → pick targets.
- Select an interaction to edit; delete/duplicate with undo/redo.
- Validation errors inline (unknown node id, unsupported event, invalid payload).

### Canvas affordances (later within v0.8)

- Optional “wiring” overlay: lines from source to targets when an interaction is selected.
- Click source in canvas to start “record interaction” flow.

## Commands

New command types (names tentative):

| Command             | Purpose                                |
| ------------------- | -------------------------------------- |
| `addInteraction`    | Insert interaction on document         |
| `updateInteraction` | Change trigger, actions, or conditions |
| `removeInteraction` | Delete by interaction id               |
| `reorderActions`    | Order within an interaction            |

All mutations return `CommandResult` and participate in history.

## Validation

An interaction is valid when:

1. `sourceNodeId` and all `targetNodeId` values reference existing nodes.
2. `trigger.event` is declared on the source component (or built-in list).
3. Each `action.type` is built-in or declared on the target component.
4. Action payloads conform to `payloadSchema` where defined.
5. No circular `setProp` loops without a guard (static analysis TBD).

## Codegen

Options (decide during implementation):

- **Runtime helper** — generated component wraps `ViewFoundryProvider` + `useInteractions` (simplest MVP).
- **Inline handlers** — emit `onClick={() => ...}` calling a generated `interactions.ts` module (better for apps that want zero runtime).

Unsupported interactions produce codegen **warnings**, not silent omission.

## Relationship to other planned features

| Feature       | Release | Relationship                                                         |
| ------------- | ------- | -------------------------------------------------------------------- |
| Style Editor  | v0.4.0  | Independent sub-mode; same toolbar pattern                           |
| `node.style`  | v0.4.0  | Actions may set style tokens later (`setStyle`)                      |
| Data bindings | v0.11.0 | Variables, bindings, conditions — [DATA_BINDING.md](DATA_BINDING.md) |
| LessonKit     | v0.7.0  | Lesson blocks may map to custom events/actions via adapter           |
| Routing       | v0.9.0  | `navigate` action; `ViewSite` multi-page — [ROUTING.md](ROUTING.md)  |
| Slots         | v0.10.0 | Named composition — [SLOTS.md](SLOTS.md)                             |
| Repeat        | v0.12.0 | List templates — [REPEAT.md](REPEAT.md)                              |

## Phased delivery (v0.8.0)

### Phase A — Model & runtime

- Types in `@viewfoundry/core`; validation; `addInteraction` / `updateInteraction` / `removeInteraction`
- Built-in events/actions; registry metadata helpers in `@viewfoundry/schema`
- Live-mode interpreter in `@viewfoundry/react`

### Phase B — Editor

- Interactions sub-mode and list/detail UI
- Wire from palette selection + inspector shortcuts
- Undo/redo for all interaction commands

### Phase C — Codegen & docs

- `generateTsx` interaction emission (runtime helper path first)
- RTD guide + example in `examples/basic-react` (button → update heading)

## Open questions

- Whether `navigate` uses `routeId`, `path`, or both — support both; site router resolves in v0.9.0.
- Global document state (variables) for multi-step flows — defer past MVP.

## See also

- [ROADMAP.md](ROADMAP.md) — v0.8.0 milestone
- [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md) — `bindings`, `conditions`
- [EDITOR_SPEC.md](EDITOR_SPEC.md) — edit sub-modes
- [PROP_SCHEMA.md](PROP_SCHEMA.md) — `action` field type for props vs interaction actions
- [UX_AND_DX.md](UX_AND_DX.md) — studio sentence UI and developer API requirements
