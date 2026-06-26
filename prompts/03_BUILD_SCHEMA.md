# Cursor Prompt: Build @viewfoundry/schema

Implement `@viewfoundry/schema` according to:

- `docs/PROP_SCHEMA.md`
- `docs/COMPONENT_REGISTRY.md`

Implement field builders:

- `text`
- `textarea`
- `number`
- `boolean`
- `select`
- `radio`
- `color`
- `image`
- `url`
- `json`

Implement:

- `defineComponent`
- `createDefaultProps`
- `validateProps`

Make the API developer-friendly and strongly typed where practical.

Acceptance criteria:

- field builders return stable schema objects
- default values can be generated from prop schema
- basic validation works
- component definitions can be consumed by `@viewfoundry/core`
