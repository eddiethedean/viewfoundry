# Troubleshooting

## Peer dependency warnings

Install all `@viewfoundry/*` packages at the **same version**:

```bash
npm install @viewfoundry/core@0.5.0 @viewfoundry/schema@0.5.0 @viewfoundry/react@0.5.0 @viewfoundry/editor@0.5.0 @viewfoundry/codegen@0.5.0 @viewfoundry/cli@0.5.0 @viewfoundry/vite@0.5.0
```

Mixed versions (e.g. `core@0.3.0` with `editor@0.4.0`) cause peer dependency warnings and subtle runtime bugs.

## Editor looks unstyled or selection overlays are missing

Import both stylesheets:

```typescript
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
```

Missing `@viewfoundry/react/styles.css` often shows as broken selection highlights or plain missing-component boxes.

## `Button is not defined` or copy-paste example fails

`defineComponent(Button, …)` requires a real React component in scope. See the [complete minimal example](getting-started.md#minimal-example) with a stub `Button` function, or copy from [`examples/basic-react`](https://github.com/eddiethedean/viewfoundry/tree/main/examples/basic-react).

## Validation errors after loading JSON

Common causes:

| Issue                  | Fix                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| Unknown node `type`    | Register every type used in the document with `createRegistry`      |
| Invalid prop value     | Check prop field schemas; use `validateProps` during development    |
| Grid out of bounds     | Ensure `layout.grid` column/row/spans fit the parent grid container |
| Overlapping grid cells | Two children cannot occupy the same cells in one grid               |

Run `validateDocument(document, registry)` or `npx @viewfoundry/cli validate ./page.json` to list issues.

## Command returned `{ ok: false, error: '…' }`

`applyCommand` and low-level commands return a `CommandResult` discriminated union:

```ts
type CommandResult = { ok: true; document: ViewDocument } | { ok: false; error: string };
```

Always check `result.ok` before using `result.document`. Errors usually mean invalid parent IDs, missing nodes, or registry constraint violations.

## Palette insert goes to the wrong parent

Ensure layout containers set `acceptsChildren: true` and list `allowedChildren` if you restrict types. Grid containers resolve the drop target cell from pointer position.

## Generated TSX has missing imports

Add every node `type` to the `imports` map passed to `generateTsx`. Missing entries produce warnings and omit imports in output.

## `pnpm docs:build` fails locally

Requirements:

- Node 20+
- Python 3 with `pip install -r apps/docs/requirements.txt`
- `pnpm install` at repo root

The build compiles packages, the docs studio embed, then runs Sphinx.

## Read the Docs build failed

Check the [RTD build log](https://readthedocs.org/projects/viewfoundry/builds/). Common fixes: ensure `pnpm` is available (configured in `.readthedocs.yaml`), and that `apps/docs/requirements.txt` installs successfully.

## Still stuck?

- [FAQ](faq.md)
- [GitHub issues](https://github.com/eddiethedean/viewfoundry/issues)
- [`specs/PACKAGE_API_SPEC.md`](https://github.com/eddiethedean/viewfoundry/blob/main/specs/PACKAGE_API_SPEC.md) for API details

## Undo and redo with controlled document

When you pass `document` and `onChange` to `ViewFoundryEditor`, the editor uses `syncDocument` to merge external updates.

- **Undo history is preserved** for edits that flow through `onChange`.
- When your app pushes an **external tree update** (for example loading from a server), the editor pushes the current document onto the undo stack before applying the new tree, so Undo can restore the pre-sync state.
- **The redo stack is cleared** on external tree sync.
- **Meta-only updates** (`document.meta` without tree changes) sync without affecting undo/redo.

Toolbar Undo/Redo works in `examples/basic-react` with standard controlled props (`useState` + `onChange`).

**Options:**

1. **Controlled (recommended)** — `useState` + `onChange`; persist to storage on change.
2. **Uncontrolled** — omit `document`; use `onChange` only to persist snapshots.
3. **App-owned history** — store snapshots yourself and restore on Undo in your UI.

See also [FAQ — controlled document undo](faq.md#why-does-undo-not-work-in-my-app).

## Style edits do not appear on the canvas

`ViewFoundryEditor` merges `node.style` into each component's `style` prop at render time. Your React components must **accept and forward `style`** to a DOM element:

```tsx
function Button({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <button type="button" style={style}>
      {children}
    </button>
  );
}
```

See [Migration from 0.3 → 0.4](migration-0.3-0.4.md) and [Component registration](component-registration.md).

## Canvas click does not select the right component

On grid layouts, pointer hit-testing can favor drop targets over selection. Use the **Layers** panel to select, reorder, and delete nodes reliably. Keyboard shortcuts (when enabled) apply to the layer-selected node.
