# Data bindings, variables & conditions

## Purpose

**Interactions** (v0.8) handle episodic events. **Bindings** keep props in sync with data sources continuously. **Variables** hold document/site state. **Conditions** show or hide nodes declaratively.

**Planned: v0.11.0** (pre-1.0)

## Data bindings

```ts
export type DataBinding = {
  source: BindingSource;
  target: { nodeId: string; propKey: string };
};

export type BindingSource =
  | { type: 'variable'; key: string }
  | { type: 'routeParam'; name: string }
  | { type: 'nodeProp'; nodeId: string; propKey: string }
  | { type: 'literal'; value: unknown };
```

Bindings live on `ViewDocument` or `ViewSite` and update target props when sources change (Live mode + controlled host updates).

## Document & site variables

```ts
export type VariableStore = Record<string, unknown>;

// ViewDocument.meta.variables or ViewSite.variables
```

Interactions (`setVariable`), form fields, and bindings read/write variables. Serializable JSON only — no functions.

## Conditional visibility

```ts
export type ConditionExpression = {
  op: 'eq' | 'neq' | 'truthy' | 'and' | 'or';
  left?: BindingSource | ConditionExpression;
  right?: unknown;
};

// ViewNode.conditions?: ConditionExpression[]
```

Runtime skips rendering (or applies `hidden`) when conditions fail. Editor shows dimmed/ghost state for hidden nodes in Edit mode (optional).

## Editor

- **Bindings panel** or inspector section per prop (“bind to…”).
- Variable editor in site/document meta drawer.
- Condition builder UI (simple rules first).

## Commands

`setBinding`, `removeBinding`, `setVariable`, `updateNodeConditions` — all via `CommandResult` + history.

## See also

- [INTERACTIONS.md](INTERACTIONS.md)
- [ROUTING.md](ROUTING.md) — route params as binding sources
- [ROADMAP.md](ROADMAP.md) — v0.11.0
- [UX_AND_DX.md](UX_AND_DX.md) — “Bind to…” and condition builder requirements
