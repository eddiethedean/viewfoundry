# Clipboard & saved blocks

> **Code-first: v0.12.0** — JSX subtree copy/paste, saved blocks in Add Elements. See [ROADMAP.md](ROADMAP.md), [DND_AND_LAYOUT_RESEARCH.md](DND_AND_LAYOUT_RESEARCH.md).

## Purpose

Productivity features for authors: **copy/paste** subtrees (including across routes) and **saved blocks** — reusable template libraries.

**Planned: v0.12.0** (code-first)

## Clipboard

- Copy selected subtree to internal clipboard (JSON fragment + registry metadata).
- Paste into eligible parent/slot/cell with new node ids.
- Keyboard: Cmd/Ctrl+C, Cmd/Ctrl+V (fix gap vs [EDITOR_SPEC.md](EDITOR_SPEC.md)).
- Cross-route paste after **v0.9** routing (paste into active page).

Commands: `copyNodes`, `pasteNodes` (or clipboard service outside history with paste as `insertNode` batch).

## Saved blocks

```ts
export type SavedBlock = {
  id: string;
  label: string;
  category?: string;
  /** Subtree template */
  root: ViewNode;
};

// ViewSite.blocks?: SavedBlock[] or host-provided library
```

- Palette category “Blocks” inserts a copy of the template (new ids).
- Optional: update linked instances when template changes (defer past MVP).

## Editor

- Toolbar + context menu: Copy, Paste, Paste into slot.
- Blocks manager drawer (CRUD on saved blocks).

## See also

- [ROADMAP.md](ROADMAP.md) — v0.13.0
- [UX_AND_DX.md](UX_AND_DX.md) — keyboard shortcuts and saved blocks UX
- [SLOTS.md](SLOTS.md) — paste target resolution
