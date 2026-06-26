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

const registry = createRegistry([buttonDef, cardDef]);

describe('createEditorStore', () => {
  it('insertComponent adds node at root and selects it', () => {
    const onChange = vi.fn();
    const store = createEditorStore(registry, createDocument(), onChange);

    store.getState().insertComponent('Button');

    const { document, selection } = store.getState();
    expect(document.root.children).toHaveLength(1);
    expect(document.root.children?.[0].type).toBe('Button');
    expect(getPrimarySelection(selection)).toBe(document.root.children?.[0].id);
    expect(onChange).toHaveBeenCalled();
  });

  it('insertComponent inserts into selected container', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Card');
    const cardId = store.getState().document.root.children?.[0].id;
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

  it('duplicateSelected adds a sibling copy', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'btn1')];
    const store = createEditorStore(registry, doc);
    store.getState().selectNode('btn1');

    store.getState().duplicateSelected();

    const children = store.getState().document.root.children ?? [];
    expect(children).toHaveLength(2);
    expect(children[0].id).not.toBe(children[1].id);
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

  it('undo and redo restore document state', () => {
    const store = createEditorStore(registry, createDocument());
    store.getState().insertComponent('Button');
    const insertedId = store.getState().document.root.children?.[0].id;

    store.getState().undo();
    expect(store.getState().document.root.children).toHaveLength(0);
    expect(getPrimarySelection(store.getState().selection)).toBeUndefined();

    store.getState().redo();
    expect(store.getState().document.root.children?.[0].id).toBe(insertedId);
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
