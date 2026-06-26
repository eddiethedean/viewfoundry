# Prop Schema Specification

## Purpose

Prop schemas generate editor controls and validate document props.

## MVP field types

- text
- textarea
- number
- boolean
- select
- radio
- color
- image
- url
- json

## Base field shape

```ts
export type BasePropField<TValue = unknown> = {
  kind: string;
  label?: string;
  description?: string;
  defaultValue?: TValue;
  required?: boolean;
  hidden?: boolean;
};
```

## Field examples

```ts
text({ label: 'Title', defaultValue: 'Untitled' });
textarea({ label: 'Body' });
number({ label: 'Columns', min: 1, max: 12, step: 1 });
boolean({ label: 'Disabled', defaultValue: false });
select({ label: 'Variant', options: ['primary', 'secondary'] });
color({ label: 'Background' });
image({ label: 'Hero Image' });
url({ label: 'Link' });
json({ label: 'Advanced Config' });
```

## Select options

```ts
export type SelectOption =
  | string
  | {
      label: string;
      value: string;
    };
```

## Inspector generation

The inspector should render one control per field. Unknown field kinds should render a fallback JSON editor or readonly warning.

## Validation

Each field builder should provide validation metadata. The MVP can validate at runtime with simple functions.

Examples:

- `required`
- `min`
- `max`
- `pattern`
- `options`

## Future field types

- richText
- markdown
- date
- datetime
- icon
- enumObject
- array
- object
- componentRef
- routeRef — picker for a site route id (planned **v0.9.0**; see `docs/ROUTING.md`)
- action — prop-level handler reference (distinct from document `interactions`; see `docs/INTERACTIONS.md`)
- dataBinding — continuous prop sync (planned post-v0.8; triggers are episodic in v0.8.0)
