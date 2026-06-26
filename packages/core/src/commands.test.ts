import { describe, expect, it } from 'vitest';
import {
  createDocument,
  createNode,
  createRegistry,
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  updateNodeProps,
  setNodeProp,
  validateDocument,
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

describe('validation', () => {
  it('detects duplicate node ids', () => {
    const doc = createDocument();
    const child = createNode('Button', {}, [], 'dup');
    doc.root.children = [child, { ...child }];
    const result = validateDocument(doc);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'DUPLICATE_NODE_ID')).toBe(true);
  });

  it('detects missing component types', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown')];
    const registry = createRegistry([buttonDef]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'UNKNOWN_COMPONENT_TYPE')).toBe(true);
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
      expect(result.document.root.children?.[0].id).not.toBe(
        result.document.root.children?.[1].id,
      );
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
  it('supports undo and redo', () => {
    const doc1 = createDocument();
    const doc2 = { ...doc1, meta: { name: 'v2' } };
    const doc3 = { ...doc1, meta: { name: 'v3' } };

    let history = createHistory(doc1);
    history = pushHistory(history, doc2);
    history = pushHistory(history, doc3);

    expect(canUndo(history)).toBe(true);
    history = undo(history);
    expect(history.present.meta?.name).toBe('v2');
    expect(canRedo(history)).toBe(true);

    history = redo(history);
    expect(history.present.meta?.name).toBe('v3');
  });
});
