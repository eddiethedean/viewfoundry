# Component Registry Specification

> **Direction (v0.7+):** `@viewfoundry/discover` and `viewfoundry import` (**v0.9**) bootstrap registry entries from existing projects. Manual `defineComponent` remains the embed-mode default. See [ROADMAP.md](ROADMAP.md).

## Purpose

The registry maps document node types to real renderable components and editing metadata.

## Component definition

```ts
export type ComponentDefinition<TProps = Record<string, unknown>> = {
  type: string;
  label?: string;
  description?: string;
  category?: string;
  component: unknown;
  props?: PropSchema<TProps>;
  defaultProps?: Partial<TProps>;
  acceptsChildren?: boolean;
  allowedChildren?: string[];
};
```

## Example registration

```ts
import { defineComponent, text, select, boolean } from '@viewfoundry/schema';
import { Button } from './Button';

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({
      label: 'Variant',
      options: ['primary', 'secondary', 'ghost'],
      defaultValue: 'primary',
    }),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
  },
});
```

## Registry API

```ts
export interface ComponentRegistry {
  register(definition: ComponentDefinition): void;
  get(type: string): ComponentDefinition | undefined;
  has(type: string): boolean;
  list(): ComponentDefinition[];
  byCategory(): Record<string, ComponentDefinition[]>;
}
```

## Design requirements

- Registry must detect duplicate types.
- Registry must allow a missing component fallback in preview/editor mode.
- Registry must be serializable enough to support codegen import maps, but component functions themselves are runtime-only.
- Prop schema should be strongly typed where possible.

## Child constraints

MVP supports simple constraints:

```ts
acceptsChildren?: boolean;
allowedChildren?: string[];
```

Future version can support:

- named slots
- max children
- min children
- required child types
- layout zones
- **bulk import from existing React projects** — scan exports, bootstrap registry entries, and codegen import maps ([ROADMAP.md](ROADMAP.md#v160---existing-project-import))
