# Cursor Prompt: Bootstrap ViewFoundry Monorepo

You are building ViewFoundry, an embeddable visual editor framework for React applications.

Read the docs in this repository first, especially:

- `docs/PROJECT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`

Create the initial monorepo structure using pnpm workspaces.

Required packages:

- `packages/core`
- `packages/schema`
- `packages/react`
- `packages/editor`
- `packages/codegen`
- `packages/vite`
- `packages/cli`

Required examples:

- `examples/basic-react`

Set up:

- root `package.json`
- `pnpm-workspace.yaml`
- shared TypeScript config
- package-level TypeScript configs
- Vitest
- package build scripts
- root scripts for `build`, `test`, `typecheck`, and `lint`

Keep implementation minimal at this stage. The goal is a clean compiling workspace.

Acceptance criteria:

- `pnpm install` succeeds
- `pnpm build` succeeds
- `pnpm typecheck` succeeds
- `pnpm test` succeeds
