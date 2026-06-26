# Cursor Prompt: Build @viewfoundry/react

Implement the React runtime package.

Read:

- `docs/ARCHITECTURE.md`
- `docs/DOCUMENT_MODEL.md`
- `docs/COMPONENT_REGISTRY.md`

Implement:

- `ViewFoundryProvider`
- `ViewRenderer`
- `ViewNodeRenderer`
- missing component fallback
- hooks:
  - `useViewDocument`
  - `useViewRegistry`
  - `useViewSelection`

The runtime should render a `ViewDocument` using registered React components.

Important:

- This package can depend on React.
- This package should not depend on `@viewfoundry/editor`.
- Rendering should support nested children.
- If a node type is missing, render a visible fallback in development/editor mode.

Acceptance criteria:

- sample document renders correctly
- nested children render correctly
- props are passed correctly
- missing component fallback works
