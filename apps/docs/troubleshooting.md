# Troubleshooting

## Peer dependency warnings

Install all `@viewfoundry/*` packages at the **same version**:

```bash
npm install @viewfoundry/core@0.3.0 @viewfoundry/schema@0.3.0 @viewfoundry/react@0.3.0 @viewfoundry/editor@0.3.0
```

Mixed versions (e.g. `core@0.2.0` with `editor@0.3.0`) cause peer dependency warnings and subtle runtime bugs.

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

When `ViewFoundryEditor` receives `document` and `onChange` from your React state, every `onChange` callback updates parent state, which re-renders the editor with a new `document` prop. The editor treats that as a fresh document and **resets undo/redo**.

**Options:**

1. **Uncontrolled** — omit `document` / `onChange` and let the editor manage state; subscribe via `onChange` only when you need to persist.
2. **App-owned history** — store document snapshots in your state and wire your own Undo/Redo UI.
3. **Hybrid** — persist on save/blur rather than on every command if you need controlled mode without constant resets.

Undo/redo toolbar buttons work out of the box in `examples/basic-react` because the demo uses a pattern that does not reset history on every edit.

## Canvas click does not select the right component

On grid layouts, pointer hit-testing can favor drop targets over selection. Use the **Layers** panel to select, reorder, and delete nodes reliably. Keyboard shortcuts (when enabled) apply to the layer-selected node.
