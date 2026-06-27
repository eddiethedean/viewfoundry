# @viewfoundry/schema

Helpers for defining editable component metadata — prop fields, style field defs, validation.

## Responsibilities

- `defineComponent(component, options)` — register schema metadata for a React component
- Prop field builders — see table below
- `createDefaultProps`, `validateProps` — default values and validation
- Style helpers — `STYLE_FIELD_DEFS`, `STYLE_FIELD_GROUPS`, `getStyleFieldsByGroup`, `validateStyleProp`

## Prop field builders

| Builder              | Value type | Notes                         |
| -------------------- | ---------- | ----------------------------- |
| `text(options?)`     | `string`   | Single-line text              |
| `textarea(options?)` | `string`   | Multi-line text               |
| `number(options?)`   | `number`   | Optional `min`, `max`, `step` |
| `boolean(options?)`  | `boolean`  | Checkbox                      |
| `select(options)`    | `string`   | Requires `options: string[]`  |
| `radio(options)`     | `string`   | Requires `options: string[]`  |
| `color(options?)`    | `string`   | Color picker                  |
| `url(options?)`      | `string`   | URL validation                |
| `json(options?)`     | `unknown`  | JSON textarea                 |

Common options: `label`, `defaultValue`, `required`, `description`, `placeholder`.

## `defineComponent` options

| Option            | Type         | Description                       |
| ----------------- | ------------ | --------------------------------- |
| `type`            | `string`     | Node type id (required)           |
| `label`           | `string`     | Display name in palette/layers    |
| `category`        | `string`     | Palette grouping                  |
| `props`           | `PropSchema` | Prop field definitions            |
| `acceptsChildren` | `boolean`    | Whether node may have child nodes |
| `allowedChildren` | `string[]`   | Restrict nested types             |

## Example

```ts
import { defineComponent, text, select, number } from '@viewfoundry/schema';

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
  },
});

export const GridDefinition = defineComponent(Grid, {
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: ['Button', 'Grid', 'Row'],
  props: {
    columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
  },
});
```

## Style field metadata

The Style Editor uses `STYLE_FIELD_DEFS` from this package (spacing, colors, typography, etc.). Integrators rarely call these directly unless building custom style UIs.

Peer dependency: `@viewfoundry/core@^0.6.0`.

Full API reference: [Package API spec](../package-api-spec.md#viewfoundryschema).

## Related

- [Component registration](../component-registration.md)
