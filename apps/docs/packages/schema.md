# @viewfoundry/schema

Helpers for defining editable component metadata.

## Responsibilities

- `defineComponent(component, options)`
- Prop field builders: `text`, `number`, `boolean`, `select`, `radio`, `color`, `url`, `json`, …
- `createDefaultProps`, `validateProps`

## Example

```ts
import { defineComponent, text, select } from '@viewfoundry/schema';

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
  },
});
```

Peer dependency: `@viewfoundry/core@^0.4.0`.
