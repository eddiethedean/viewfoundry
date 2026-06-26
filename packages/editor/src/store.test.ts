import { describe, expect, it, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createRegistry,
  findNode,
  getPrimarySelection,
} from '@viewfoundry/core';
import { text } from '@viewfoundry/schema';
import { createEditorStore } from './store.js';

const buttonDef = {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  component: () => null,
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
  },
  defaultProps: { children: 'Click me' },
};

const cardDef = {
  type: 'Card',
  label: 'Card',
  category: 'Layout',
  component: () => null,
  acceptsChildren: true,
};

const gridDef = {
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  component: () => null,
  acceptsChildren: true,
  defaultProps: { columns: 4, rows: 2, gap: 8 },
};

const registry = createRegistry([buttonDef, cardDef, gridDef]);

describe('createEditorStore', () => {
  it('insertComponent bootstraps a grid on empty canvas', () => {
    const onChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), onChange);

    store.getState().insertComponent('Button');

    const { document, selection } = store.getState();
    expect(document.root.children).toHaveLength(1);
    expect(document.root.children?.[0].type).toBe('Grid');
    const button = document.root.children?.[0].children?.[0];
    expect(button?.type).toBe('Button');
    expect(button?.layout?.grid).toEqual({ column: 1, row: 1, colSpan: 1, rowSpan: 1 });
    expect(getPrimarySelection(selection)).toBe(button?.id);
    expect(onChange).toHaveBeenCalled();
  });

  it('insertComponent inserts into selected container', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Card');
    const grid = store.getState().document.root.children?.[0];
    const cardId = grid?.children?.[0]?.id;
    if (!cardId) throw new Error('card missing');
    store.getState().selectNode(cardId);

    store.getState().insertComponent('Button');

    const card = findNode(store.getState().document.root, cardId);
    expect(card?.children).toHaveLength(1);
    expect(card?.children?.[0].type).toBe('Button');
  });

  it('ignores insertComponent for unknown types', () => {
    const onChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), onChange);
    store.getState().insertComponent('Unknown');
    expect(store.getState().document.root.children).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deleteSelected removes node and clears selection', () => {
    const onChange = vi.fn();
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'btn1')];
    const store = createEditorStore(registry, doc, onChange);
    store.getState().selectNode('btn1');

    store.getState().deleteSelected();

    expect(store.getState().document.root.children).toHaveLength(0);
    expect(getPrimarySelection(store.getState().selection)).toBeUndefined();
    expect(onChange).toHaveBeenCalled();
  });

  it('does not delete root selection', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().selectNode('root');
    store.getState().deleteSelected();
    expect(store.getState().document.root.id).toBe('root');
  });

  it('duplicateSelected adds a sibling copy and selects the duplicate', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'btn1')];
    const store = createEditorStore(registry, doc);
    store.getState().selectNode('btn1');

    store.getState().duplicateSelected();

    const children = store.getState().document.root.children ?? [];
    expect(children).toHaveLength(2);
    expect(children[0].id).not.toBe(children[1].id);
    expect(getPrimarySelection(store.getState().selection)).toBe(children[1].id);
  });

  it('revertDocument restores document and syncs history.present', () => {
    const onChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), onChange);
    store.getState().insertComponent('Button');
    const snapshot = createDocument();

    store.getState().revertDocument(snapshot);

    expect(store.getState().document).toEqual(snapshot);
    expect(store.getState().history.present).toEqual(snapshot);
    expect(onChange).toHaveBeenCalledWith(snapshot);
  });

  it('syncDocument updates present without resetting history or calling onChange', () => {
    const onChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), onChange);
    store.getState().insertComponent('Button');
    const pastLength = store.getState().history.past.length;
    onChange.mockClear();

    const external = structuredClone(store.getState().document);
    external.meta = { name: 'External sync' };
    store.getState().syncDocument(external);

    expect(store.getState().document.meta?.name).toBe('External sync');
    expect(store.getState().history.past).toHaveLength(pastLength);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('syncDocument clears redo only when tree content changes', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    store.getState().undo();
    expect(store.getState().history.future.length).toBeGreaterThan(0);

    const metaOnly = structuredClone(store.getState().document);
    metaOnly.meta = { name: 'Meta only' };
    store.getState().syncDocument(metaOnly);
    expect(store.getState().history.future.length).toBeGreaterThan(0);

    const external = createDocument();
    external.root.children = [createNode('Card', {}, [], 'card1')];
    store.getState().syncDocument(external);
    expect(store.getState().history.future).toHaveLength(0);
  });

  it('syncDocument clears selection when selected node is removed', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'btn1')];
    const store = createEditorStore(registry, doc);
    store.getState().selectNode('btn1');

    const external = createDocument();
    store.getState().syncDocument(external);

    expect(getPrimarySelection(store.getState().selection)).toBeUndefined();
  });

  it('insertComponent targets existing grid when nothing is selected', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    store.getState().clearSelection();

    store.getState().insertComponent('Button');

    const grid = store.getState().document.root.children?.[0];
    expect(grid?.children).toHaveLength(2);
    expect(grid?.children?.[1]?.layout?.grid).toBeTruthy();
  });

  it('updateProp changes selected node props', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'btn1')];
    const onChange = vi.fn();
    const store = createEditorStore(registry, doc, onChange);
    store.getState().selectNode('btn1');

    store.getState().updateProp('children', 'Updated');

    const node = findNode(store.getState().document.root, 'btn1');
    expect(node?.props?.children).toBe('Updated');
    expect(onChange).toHaveBeenCalled();
  });

  it('moveNodeToCell updates grid placement', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    const buttonId = store.getState().document.root.children?.[0].children?.[0]?.id;
    const gridId = store.getState().document.root.children?.[0].id;
    if (!buttonId || !gridId) throw new Error('nodes missing');

    store.getState().moveNodeToCell(buttonId, gridId, { column: 2, row: 1 });
    const button = findNode(store.getState().document.root, buttonId);
    expect(button?.layout?.grid?.column).toBe(2);
  });

  it('nudgeNodeLayout moves within bounds', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    const buttonId = store.getState().document.root.children?.[0].children?.[0]?.id;
    if (!buttonId) throw new Error('button missing');
    store.getState().selectNode(buttonId);

    store.getState().nudgeNodeLayout(buttonId, { column: 1 });
    const button = findNode(store.getState().document.root, buttonId);
    expect(button?.layout?.grid?.column).toBe(2);
  });

  it('undo and redo restore document state', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    const insertedId = store.getState().document.root.children?.[0].children?.[0]?.id;

    store.getState().undo();
    expect(store.getState().document.root.children).toHaveLength(0);
    expect(getPrimarySelection(store.getState().selection)).toBeUndefined();

    store.getState().redo();
    expect(store.getState().document.root.children?.[0].children?.[0]?.id).toBe(insertedId);
  });

  it('setStudioMode calls onStudioModeChange', () => {
    const onStudioModeChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), undefined, {
      onStudioModeChange,
    });

    store.getState().setStudioMode('live');
    expect(store.getState().studioMode).toBe('live');
    expect(onStudioModeChange).toHaveBeenCalledWith('live');
  });

  it('setStudioMode is a no-op when mode is unchanged', () => {
    const onStudioModeChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), undefined, {
      onStudioModeChange,
    });

    store.getState().setStudioMode('edit');
    expect(onStudioModeChange).not.toHaveBeenCalled();
  });

  it('initializes with defaultStudioMode live', () => {
    const store = createEditorStore(registry, createDocument(), undefined, {
      defaultStudioMode: 'live',
    });
    expect(store.getState().studioMode).toBe('live');
  });
});
