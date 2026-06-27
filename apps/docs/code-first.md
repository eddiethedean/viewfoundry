# Code-first mode (v0.7)

ViewFoundry **code-first** editing treats TSX source files as the source of truth. Visual edits on a **board** produce readable file diffs instead of JSON document mutations.

## When to use code-first vs embed

| Mode                | Source of truth     | Best for                                                  |
| ------------------- | ------------------- | --------------------------------------------------------- |
| **Embed** (default) | `ViewDocument` JSON | CMS embeds, JSON-driven pages, RTD Studio                 |
| **Code-first**      | `.tsx` files        | Component libraries, design systems, Git-friendly UI work |

Both modes share the same component registry and schema. Embed APIs are unchanged in v0.7.

## Quick start

### 1. Install packages

```bash
npm install @viewfoundry/core@0.7.0 @viewfoundry/schema@0.7.0 @viewfoundry/react@0.7.0 \
  @viewfoundry/editor@0.7.0 @viewfoundry/sync@0.7.0 @viewfoundry/board@0.7.0 @viewfoundry/vite@0.7.0
```

### 2. Add a board fixture

Create `src/boards/Button.board.tsx`:

```tsx
import { createBoard } from '@viewfoundry/board';
import { ButtonFixture } from '../code-first/fixture.js';

export default createBoard({
  name: 'Button',
  component: ButtonFixture,
  props: {},
  sourceFile: 'src/code-first/fixture.tsx',
  viewport: { width: 360, height: 200 },
});
```

### 3. Configure Vite

```ts
import { viewfoundry, viewfoundryCodeFirst, viewfoundryLocInjection } from '@viewfoundry/vite';

export default defineConfig({
  plugins: [
    react(),
    viewfoundry({
      /* embed document — optional */
    }),
    viewfoundryCodeFirst({ boards: 'src/**/*.board.tsx' }),
    viewfoundryLocInjection(),
  ],
});
```

### 4. Mount the dual-mode editor

```tsx
<ViewFoundryEditor
  mode="code-first"
  registry={registry}
  board={board}
  sourceFiles={{ 'src/code-first/fixture.tsx': fixtureSource }}
  activeSourceFile="src/code-first/fixture.tsx"
  onSourceFilesChange={setSourceFiles}
/>
```

## Try the example

```bash
pnpm --filter basic-react dev
# Embed (default): http://localhost:5173/
# Code-first:      http://localhost:5173/?mode=code-first
```

## Packages

- **`@viewfoundry/sync`** — parse TSX, patch structure/props, validate, file history
- **`@viewfoundry/board`** — isolated component fixtures via `createBoard()`
- **`@viewfoundry/react`** — `CodeFirstProvider`, `SourceBoundary`, `AstStageRenderer`
- **`@viewfoundry/vite`** — board discovery (`virtual:viewfoundry/boards`), loc injection, HMR

See [Package API spec](package-api-spec.md) for full exports.

## Editor UI (code-first)

| Panel          | Purpose                                          |
| -------------- | ------------------------------------------------ |
| **Board**      | Active board selector (single board in v0.7)     |
| **Stage**      | Renders parsed JSX from the active source file   |
| **Elements**   | JSX tree with selection and jump-to-source hints |
| **Properties** | Schema-driven prop edits → `patchSetProp`        |

Toolbar: Edit/Live toggle, viewport W×H, parent-first / child-first click modes, file undo/redo.

## HMR

External IDE edits to board source files trigger `viewfoundry:source-update` over Vite HMR. Wire your app shell to reload `sourceFiles` when the event fires.

## Next milestones

- Styles panel, Theme Manager → v0.8
- Discover / Add Elements → v0.9
- App tab, full-page editing → v0.10

See [Roadmap & direction](roadmap-and-direction.md) and repository [ROADMAP.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/ROADMAP.md) for the full plan.
