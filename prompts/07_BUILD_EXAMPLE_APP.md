# Cursor Prompt: Build Basic React Example

> **Note:** Embed-mode demo. Code-first example path planned v0.7 — [docs/CODE_FIRST.md](../docs/CODE_FIRST.md).

Create `examples/basic-react` as a working demo of ViewFoundry.

The example should include:

- Vite React app
- a small component library:
  - Button
  - Card
  - Stack
  - Heading
  - Text
- ViewFoundry component definitions for each component
- an editor page with **Edit / Live toggle in one window** (not separate editor and preview pages)
- optional JSON panel and TSX export demo if `@viewfoundry/codegen` is implemented

Acceptance criteria:

- `pnpm dev` in the example runs
- components can be inserted and edited
- document persists in localStorage
