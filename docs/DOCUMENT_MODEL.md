# ViewFoundry Document Model

> **Embed mode only.** From v0.7, the primary authoring path is **code-first** — TSX and CSS files are the source of truth. This document describes the JSON model used by v0.1–v0.6 embed workflows (CMS, RTD Studio, `generateTsx`). See [CODE_FIRST.md](CODE_FIRST.md).

## Goals

The embed document model must be:

- serializable
- stable across versions
- easy to diff
- easy to validate
- renderer-agnostic
- suitable for JSON storage
- suitable for TSX code generation

## Current model (v0.5.0)

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

export type GridPlacement = {
  column?: number;
  row?: number;
  colSpan?: number;
  rowSpan?: number;
};

export type NodeLayout = {
  grid?: GridPlacement;
  /** grid container track definition when node is a layout container */
  tracks?: {
    columns?: number | string;
    rows?: number | string;
    gap?: number | string;
  };
};

export type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  layout?: NodeLayout;
};
```

Package semver (`0.4.0`) is separate from `ViewDocument.version` (`'0.1'`). New optional fields like `layout` and `style` are added during `0.x` without bumping the document schema version.

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

`children` is a simple ordered array. Grid reading order in the editor follows `layout.grid` placement when present.

Future slot support can extend this to named slots:

```ts
children?: ViewNode[];
slots?: Record<string, ViewNode[]>;
```

Do not implement `slots` until a release requires them.

## Props

Props are arbitrary JSON-compatible values but should be validated against registered component prop schemas.

Allowed prop value types:

- string
- number
- boolean
- null
- arrays of JSON-compatible values
- plain objects

Avoid functions in document JSON. For callbacks/actions, use **interaction references** on the document (see `docs/INTERACTIONS.md`, planned **v0.8.0**) or prop-level action fields.

## Layout (shipped v0.3.0)

`layout.grid` stores CSS Grid child placement separately from `props`:

- `column`, `row` — 1-based cell origin
- `colSpan`, `rowSpan` — span across tracks

Grid containers (registered components like `Grid` / `Row`) define track counts and gap via `props`. Validation rejects out-of-bounds spans and overlapping placements within a container.

See [Grid layout guide](https://viewfoundry.readthedocs.io/en/latest/grid-layout.html) for editor and codegen behavior.

## Style (shipped v0.4.0)

`style` stores presentation values separately from schema-backed `props`:

- spacing, size, colors, typography, border, layout, opacity
- JSON-serializable strings or numbers; optional token references (e.g. `color.primary`)

See [Migration 0.3 → 0.4](https://viewfoundry.readthedocs.io/en/latest/migration-0.3-0.4.html).

## Validation rules

A document is valid when:

1. It has a supported `version`.
2. It has a root node.
3. Every node ID is unique.
4. Every node type exists in the registry, unless missing components are explicitly allowed.
5. Every prop conforms to its field schema.
6. Child constraints are respected.
7. Grid placements are in bounds and non-overlapping within layout containers.
8. Style values conform to validation rules when `node.style` is present.

## Future additions (embed backlog)

The fields below were planned for JSON-only features. **New work targets code-first source instead.** Implement on the embed path only if CMS customers require them post-1.0.

```ts
export type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: ViewDocumentMeta;
  interactions?: Interaction[]; // embed backlog — code-first uses TSX handlers (v0.11)
};

export type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
  slots?: Record<string, ViewNode[]>; // embed backlog — JSX children in code-first
  bindings?: Record<string, DataBinding>; // embed backlog
  conditions?: ConditionExpression[]; // embed backlog
  repeat?: RepeatExpression; // embed backlog
  style?: StyleTokenMap; // shipped embed mode (v0.4)
  layout?: NodeLayout; // shipped embed mode (v0.3)
};
```

### Interactions (embed backlog)

Document-level `interactions` were planned for JSON wiring. **Code-first (v0.11)** writes handler props and callbacks in TSX instead. See [INTERACTIONS.md](INTERACTIONS.md).

### Routing (embed backlog)

`ViewSite` / multi-document routes were planned for JSON. **Code-first (v0.10)** edits route files in source. See [ROUTING.md](ROUTING.md).

### Repeat, slots, bindings (embed backlog)

See [REPEAT.md](REPEAT.md), [SLOTS.md](SLOTS.md), [DATA_BINDING.md](DATA_BINDING.md). Code-first authors use standard React patterns (`.map()`, children, state).

### Style Editor mode (shipped v0.4.0)

The `style` field powers **Style Editor mode** (see `docs/EDITOR_SPEC.md`). It stores presentation values separately from schema-backed `props`:

- spacing (`margin`, `padding`, `gap`)
- size (`width`, `height`, `minWidth`, `maxWidth`)
- colors (`color`, `backgroundColor`, `borderColor`)
- typography (`fontSize`, `fontWeight`, `lineHeight`, `textAlign`)
- border and radius
- layout (`display`, `flexDirection`, `alignItems`, `justifyContent`)
- opacity and overflow

Styles must remain JSON-serializable. Avoid functions. Codegen should map `style` to JSX `style` objects or registered class/token helpers.
