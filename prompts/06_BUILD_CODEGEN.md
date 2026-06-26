# Cursor Prompt: Build @viewfoundry/codegen

Implement code generation according to:

- `docs/CODEGEN_SPEC.md`

Build:

- `generateTsx`
- import map support
- warnings
- deterministic formatting

The generator should convert a `ViewDocument` into a readable React component.

Support:

- normal props
- boolean props
- string children
- nested children
- fragments for root children
- missing import warnings
- unsupported value warnings

Acceptance criteria:

- tests cover simple, nested, and edge-case documents
- output is deterministic
- generated TSX is readable
