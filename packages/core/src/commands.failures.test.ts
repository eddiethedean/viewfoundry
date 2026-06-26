import { describe, expect, it } from 'vitest';
import {
  createDocument,
  createNode,
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  updateNodeProps,
  setNodeProp,
  findNode,
} from '../src/index.js';
import { expectCommandFailure, expectDocumentUnchanged } from './test-helpers.js';

describe('command failures', () => {
  it('fails to insert into missing parent', () => {
    const doc = createDocument();
    const result = insertNode(doc, {
      parentId: 'missing',
      node: createNode('Button'),
    });
    expectCommandFailure(result, 'Parent node not found: missing');
  });

  it('fails to delete missing node', () => {
    const doc = createDocument();
    const result = deleteNode(doc, { nodeId: 'missing' });
    expectCommandFailure(result, 'Node not found: missing');
  });

  it('fails to duplicate missing node', () => {
    const doc = createDocument();
    const result = duplicateNode(doc, { nodeId: 'missing' });
    expectCommandFailure(result, 'Node not found: missing');
  });

  it('fails to duplicate root node', () => {
    const doc = createDocument();
    const result = duplicateNode(doc, { nodeId: 'root' });
    expectCommandFailure(result, 'Cannot duplicate root node');
  });

  it('fails to move root node', () => {
    const doc = createDocument();
    const result = moveNode(doc, {
      nodeId: 'root',
      parentId: 'root',
      index: 0,
    });
    expectCommandFailure(result, 'Cannot move root node');
  });

  it('fails to move missing node', () => {
    const doc = createDocument();
    const result = moveNode(doc, {
      nodeId: 'missing',
      parentId: 'root',
      index: 0,
    });
    expectCommandFailure(result, 'Node not found: missing');
  });

  it('fails to move to missing parent', () => {
    const doc = createDocument();
    const button = createNode('Button', {}, [], 'btn1');
    const inserted = insertNode(doc, { parentId: 'root', node: button });
    if (!inserted.ok) throw new Error(inserted.error);

    const result = moveNode(inserted.document, {
      nodeId: 'btn1',
      parentId: 'missing',
      index: 0,
    });
    expectCommandFailure(result, 'Parent node not found: missing');
  });

  it('fails to update props on missing node', () => {
    const doc = createDocument();
    const result = updateNodeProps(doc, {
      nodeId: 'missing',
      props: { children: 'x' },
    });
    expectCommandFailure(result, 'Node not found: missing');
  });

  it('fails to set prop on missing node', () => {
    const doc = createDocument();
    const result = setNodeProp(doc, {
      nodeId: 'missing',
      key: 'disabled',
      value: true,
    });
    expectCommandFailure(result, 'Node not found: missing');
  });
});

describe('command immutability', () => {
  it('does not mutate input document on insert', () => {
    const doc = createDocument();
    expectDocumentUnchanged(doc, () =>
      insertNode(doc, { parentId: 'root', node: createNode('Button', {}, [], 'b1') }),
    );
  });

  it('does not mutate input document on delete', () => {
    let doc = createDocument();
    const inserted = insertNode(doc, {
      parentId: 'root',
      node: createNode('Button', {}, [], 'b1'),
    });
    if (!inserted.ok) throw new Error(inserted.error);
    doc = inserted.document;

    expectDocumentUnchanged(doc, () => deleteNode(doc, { nodeId: 'b1' }));
  });

  it('does not mutate input document on move', () => {
    let doc = createDocument();
    let result = insertNode(doc, {
      parentId: 'root',
      node: createNode('Button', {}, [], 'btn1'),
    });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = insertNode(doc, { parentId: 'root', node: createNode('Card', {}, [], 'card1') });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    expectDocumentUnchanged(doc, () =>
      moveNode(doc, { nodeId: 'btn1', parentId: 'card1', index: 0 }),
    );
  });
});

describe('command edge cases', () => {
  it('inserts at explicit index 0', () => {
    let doc = createDocument();
    let result = insertNode(doc, {
      parentId: 'root',
      node: createNode('Button', { children: 'Second' }, [], 'b2'),
    });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = insertNode(doc, {
      parentId: 'root',
      node: createNode('Button', { children: 'First' }, [], 'b1'),
      index: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.root.children?.[0].id).toBe('b1');
      expect(result.document.root.children?.[1].id).toBe('b2');
    }
  });

  it('updateNodeProps replaces entire props object', () => {
    let doc = createDocument();
    const button = createNode(
      'Button',
      { children: 'Hi', disabled: true, variant: 'primary' },
      [],
      'btn1',
    );
    let result = insertNode(doc, { parentId: 'root', node: button });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = updateNodeProps(doc, { nodeId: 'btn1', props: { children: 'Updated' } });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const node = findNode(result.document.root, 'btn1');
      expect(node?.props).toEqual({ children: 'Updated' });
    }
  });

  it('setNodeProp merges into existing props', () => {
    let doc = createDocument();
    const button = createNode('Button', { children: 'Hi' }, [], 'btn1');
    let result = insertNode(doc, { parentId: 'root', node: button });
    if (!result.ok) throw new Error(result.error);
    doc = result.document;

    result = setNodeProp(doc, { nodeId: 'btn1', key: 'disabled', value: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const node = findNode(result.document.root, 'btn1');
      expect(node?.props).toEqual({ children: 'Hi', disabled: true });
    }
  });
});
