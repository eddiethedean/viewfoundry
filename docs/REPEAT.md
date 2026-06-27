# Repeat & lists

> **Embed-mode backlog.** Code-first uses `.map()` and list components in TSX. See [CODE_FIRST.md](CODE_FIRST.md).

## Purpose

Render a **template subtree** once per item in a list — nav menus, card grids, table rows.

**Planned: embed backlog** (was v0.12.0 JSON `repeat`)

## Model

```ts
export type RepeatExpression = {
  /** Static list in JSON for MVP */
  items?: unknown[];
  /** Bind to variable or prop (v0.11+) */
  source?: BindingSource;
  /** Key field for React list keys when items are objects */
  itemKey?: string;
};

// ViewNode.repeat?: RepeatExpression
```

Children of a repeating node act as the **item template**. Runtime clones template per item; editor shows preview count or first N items.

## Editor

- Inspector: edit static `items` JSON array or bind to variable.
- Canvas: “repeat preview” with 1–3 ghost instances (optional).
- Validation: template root constraints; stable keys when possible.

## Codegen

- Emit `.map()` over items with template as render function body or subcomponent.

## See also

- [DATA_BINDING.md](DATA_BINDING.md)
- [ROADMAP.md](ROADMAP.md) — v0.12.0
- [UX_AND_DX.md](UX_AND_DX.md) — list editor and repeat preview requirements
