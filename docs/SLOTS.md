# Named slots & composition

## Purpose

Most real React components use **named slots** (header, footer, actions) or compound-component patterns — not a single `children` array. ViewFoundry must model slot content in JSON and support slot-aware editing and codegen.

**Planned: v0.10.0** (pre-1.0)

## Goals

- `slots?: Record<string, ViewNode[]>` on `ViewNode` (alongside or instead of default `children` where registry defines slots).
- Registry declares slot names, labels, and constraints (`allowedChildren` per slot).
- Palette and canvas drop targets per slot; layers panel shows slot groups.
- Codegen emits props or JSX children into the correct slot API for each component.

## Registry

```ts
export type ComponentSlot = {
  id: string;
  label: string;
  acceptsChildren?: boolean;
  allowedChildren?: string[];
  maxChildren?: number;
};

export type ComponentDefinition = {
  // ...
  slots?: ComponentSlot[];
  defaultSlot?: string; // 'children' when omitted
};
```

## Editor

- Inspector or canvas overlays label each slot region.
- Insert/reparent commands accept `slotId` + `parentId`.
- Validation: slot exists on parent type, child types allowed, max count respected.

## Codegen

- Map slot trees to component API (`header={...}`, `<Card.Header>`, or render-prop patterns via host metadata).

## See also

- [DOCUMENT_MODEL.md](DOCUMENT_MODEL.md)
- [COMPONENT_REGISTRY.md](COMPONENT_REGISTRY.md)
- [ROADMAP.md](ROADMAP.md) — v0.10.0
- [UX_AND_DX.md](UX_AND_DX.md) — labeled slot regions and codegen requirements
