# FAQ

## What is the difference between package version and document version?

**Package semver** (e.g. `0.4.0` on npm) tracks the ViewFoundry libraries. **Document schema version** (`ViewDocument.version: '0.1'`) tracks the JSON shape of saved documents. They are independent — you can run `@viewfoundry/*@0.4.0` while documents still use `version: '0.1'`.

New optional fields (like `layout` in v0.3.0 and `style` in v0.4.0) are added without bumping the document schema version during `0.x`.

## Do I need to clone the monorepo?

No. Install `@viewfoundry/*` packages from npm and follow [Getting started](getting-started.md). Clone the repo only if you are [contributing](https://github.com/eddiethedean/viewfoundry/blob/main/CONTRIBUTING.md) or running the full example app locally.

## Why do I need two CSS files for the editor?

`@viewfoundry/editor/styles.css` styles editor chrome (palette, toolbar, inspector). `@viewfoundry/react/styles.css` styles runtime canvas overlays (selection outlines, missing-component fallbacks). Import both when embedding `ViewFoundryEditor`.

## Can I render documents without the editor?

Yes. Use `@viewfoundry/react` only — `ViewFoundryProvider` + `ViewRenderer`. The editor package is not required at runtime for end users.

## How does TSX export know where to import components?

You provide an **import map** to `generateTsx`. Each document node `type` maps to `{ importPath, exportName }`. See [Getting started — Codegen](getting-started.md#codegen-and-import-maps).

## Does the CLI export production-ready code?

`viewfoundry export` validates the JSON and writes TSX, but uses an **empty import map** unless you export from application code with `generateTsx` and your own map. For production exports, call `generateTsx` in your app (as `examples/basic-react` does).

## What changed in v0.3.0?

Grid layout, canvas drag-and-drop, `layout.grid` on nodes, grid-aware codegen, and reliability fixes for Live mode layout, `moveNode`, and controlled embed history. See [Migration from 0.2 → 0.3](migration-0.2-0.3.md) and the [changelog](changelog.md).

## What changed in v0.4.0?

Style Editor sub-mode (Component | Style), `node.style` on documents, style commands (`setStyleProp`, `updateNodeStyle`), inline style codegen, and token-aware rendering. See [Migration from 0.3 → 0.4](migration-0.3-0.4.md) and the [changelog](changelog.md).

## Why does undo not work in my app?

If you pass **controlled** `document` and `onChange` props, the editor uses `syncDocument` to merge external updates. That **preserves undo history** for editor-originated edits. External **tree** sync pushes the current document onto the undo stack before replacing it, and **clears the redo stack**. Meta-only parent updates sync without resetting history.

**Workarounds:**

- Let the editor own document state internally (uncontrolled), or
- Keep history in your app and pass a restored document when the user clicks Undo in your own toolbar.

See [Troubleshooting — controlled document](troubleshooting.md#undo-and-redo-with-controlled-document).

## Where is the full API reference?

The authoritative API contract is [`specs/PACKAGE_API_SPEC.md`](https://github.com/eddiethedean/viewfoundry/blob/main/specs/PACKAGE_API_SPEC.md) on GitHub. These docs are user guides; the spec may include details not yet mirrored here.

## What are the `docs/` files in the repo?

The repository `docs/` folder holds **planning and design specs** (roadmap, editor spec, document model). They may lag implementation. **Published user docs** are this Read the Docs site (`apps/docs/`).

## Is ViewFoundry stable?

ViewFoundry is **early-access** during `0.x`. Minor releases may add APIs and optional document fields. See [0.x stability](https://github.com/eddiethedean/viewfoundry#0x-stability) in the README.

## Who is the editor for — authors or developers?

**Both**, with different entry points:

- **Studio users** (authors, designers) use Edit / Live, the palette, layers, and inspector to build pages without writing React. Success means plain-language UI, safe defaults, and undo for mistakes.
- **React developers** embed `ViewFoundryEditor`, register real components with `defineComponent`, persist `ViewDocument` JSON, and export TSX. Success means typed APIs, copy-pasteable examples, and codegen you would ship.

Usability bars for both audiences are defined in the repo planning doc [UX_AND_DX.md](https://github.com/eddiethedean/viewfoundry/blob/main/docs/UX_AND_DX.md) (maintainers use this for release review).

## How do I select a component on the grid canvas?

Use the **Layers** panel for reliable selection when grid drop overlays are active. Canvas click selection can be ambiguous when multiple drop targets overlap — we are improving this in future releases.
