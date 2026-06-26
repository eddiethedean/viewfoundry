import { describe, expect, it } from 'vitest';
import {
  createDocument,
  createNode,
  createRegistry,
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  setNodeLayout,
  updateNodeProps,
  setNodeProp,
  createHistory,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  findNode,
} from '../src/index.js';

const buttonDef = {
  type: 'Button',
  label: 'Button',
  component: () => null,
  acceptsChildren: true,
};

describe('document', () => {
  it('creates a default document', () => {
    const doc = createDocument();
    expect(doc.version).toBe('0.1');
    expect(doc.root.type).toBe('Root');
    expect(doc.root.children).toEqual([]);
  });

  it('creates nodes with generated ids', () => {
    const node = createNode('Button', { children: 'Click' });
    expect(node.type).toBe('Button');
    expect(node.id).toBeTruthy();
    expect(node.props?.children).toBe('Click');
  });
});

describe('registry', () => {
  it('registers and retrieves components', () => {
    const registry = createRegistry([buttonDef]);
    expect(registry.has('Button')).toBe(true);
    expect(registry.get('Button')?.label).toBe('Button');
  });

  it('detects duplicate types', () => {
    const registry = createRegistry();
    registry.register(buttonDef);
    expect(() => registry.register(buttonDef)).toThrow(/already registered/);
  });

  it('groups by category', () => {
    const registry = createRegistry([
      { ...buttonDef, category: 'Controls' },
      { type: 'Card', component: () => null, category: 'Layout' },
    ]);
    const grouped = registry.byCategory();
    expect(grouped.Controls).toHaveLength(1);
    expect(grouped.Layout).toHaveLength(1);
  });
});

describe('commands', () => {
  const makeDoc = () => {
    const doc = createDocument();
    const button = createNode('Button', { children: 'Hi' }, [], 'btn1');
    const result = insertNode(doc, { parentId: 'root', node: button });
    if (!result.ok) throw new Error(result.error);
    return result.document;
  };

  it('inserts a node', () => {
    const doc = makeDoc();
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children?.[0].type).toBe('Button');
  });

  it('deletes a node', () => {
    const doc = makeDoc();
    const result = deleteNode(doc, { nodeId: 'btn1' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.root.children).toHaveLength(0);
    }
  });

  it('cannot delete root', () => {
    const doc = createDocument();
    const result = deleteNode(doc, { nodeId: 'root' });
    expect(result.ok).toBe(false);
  });

  it('duplicates a node', () => {
    const doc = makeDoc();
    const result = duplicateNode(doc, { nodeId: 'btn1' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.root.children).toHaveLength(2);
      expect(result.document.root.children?.[0].type).toBe('Button');
      expect(result.document.root.children?.[1].type).toBe('Button');
      expect(result.document.root.children?.[0].id).not.toBe(result.document.root.children?.[1].id);
    }
  });

  it('moves a node with grid layout', () => {
    let doc = makeDoc();
    const grid = createNode('Grid', { columns: 4, rows: 2 }, [], 'grid1');
    let result = insertNode(doc, { parentId: 'root', node: grid });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = moveNode(doc, {
      nodeId: 'btn1',
      parentId: 'grid1',
      index: 0,
      layout: { column: 2, row: 1 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const btn = findNode(result.document.root, 'btn1');
      expect(btn?.layout?.grid).toEqual({ column: 2, row: 1 });
    }
  });

  it('sets node layout in place', () => {
    let doc = makeDoc();
    const grid = createNode('Grid', { columns: 4, rows: 2 }, [], 'grid1');
    let result = insertNode(doc, {
      parentId: 'root',
      node: grid,
    });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;
    result = insertNode(doc, {
      parentId: 'grid1',
      node: createNode('Button', {}, [], 'btn1'),
      layout: { column: 1, row: 1 },
    });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = setNodeLayout(doc, { nodeId: 'btn1', layout: { column: 3, row: 1 } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const btn = findNode(result.document.root, 'btn1');
      expect(btn?.layout?.grid).toEqual({ column: 3, row: 1 });
    }
  });

  it('moves a node', () => {
    let doc = makeDoc();
    const card = createNode('Card', {}, [], 'card1');
    let result = insertNode(doc, { parentId: 'root', node: card });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = moveNode(doc, { nodeId: 'btn1', parentId: 'card1', index: 0 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const cardNode = findNode(result.document.root, 'card1');
      expect(cardNode?.children).toHaveLength(1);
      expect(cardNode?.children?.[0].id).toBe('btn1');
    }
  });

  it('updates node props', () => {
    const doc = makeDoc();
    const result = updateNodeProps(doc, { nodeId: 'btn1', props: { children: 'Updated' } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const node = findNode(result.document.root, 'btn1');
      expect(node?.props?.children).toBe('Updated');
    }
  });

  it('sets a single prop', () => {
    const doc = makeDoc();
    const result = setNodeProp(doc, { nodeId: 'btn1', key: 'disabled', value: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const node = findNode(result.document.root, 'btn1');
      expect(node?.props?.disabled).toBe(true);
    }
  });
});

describe('history', () => {
  it('supports undo and redo with command mutations', () => {
    const doc = createDocument();
    let history = createHistory(doc);
    const button = createNode('Button', {}, [], 'b1');

    const insertResult = insertNode(doc, { parentId: 'root', node: button });
    if (!insertResult.ok) throw new Error(insertResult.error);
    history = pushHistory(history, insertResult.document);

    expect(canUndo(history)).toBe(true);
    history = undo(history);
    expect(findNode(history.present.root, 'b1')).toBeUndefined();

    expect(canRedo(history)).toBe(true);
    history = redo(history);
    expect(findNode(history.present.root, 'b1')).toBeDefined();
  });

  it('does not push history when document reference is unchanged', () => {
    const doc = createDocument();
    let history = createHistory(doc);
    history = pushHistory(history, doc);
    expect(history.past).toHaveLength(0);
  });
});
