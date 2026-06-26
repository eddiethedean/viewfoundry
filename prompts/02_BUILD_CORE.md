# Cursor Prompt: Build @viewfoundry/core

Implement `@viewfoundry/core` according to:

- `docs/DOCUMENT_MODEL.md`
- `docs/COMPONENT_REGISTRY.md`
- `docs/COMMANDS_AND_HISTORY.md`

Implement:

- `ViewDocument`
- `ViewNode`
- `ComponentDefinition`
- `ComponentRegistry`
- document utilities
- validation utilities
- command functions
- history helpers
- selection types

Required command operations:

- insert node
- delete node
- duplicate node
- move node
- update props
- set prop

Add tests for every command and utility.

Important rules:

- Do not import React.
- Keep the core framework-agnostic.
- Use immutable updates.
- Return clear errors or typed results for invalid operations.
- Do not mutate input documents.

Acceptance criteria:

- package builds
- tests cover command behavior
- duplicate node IDs are detected by validation
- missing component types are detected by validation when a registry is supplied
