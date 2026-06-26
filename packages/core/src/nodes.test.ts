import { describe, expect, it } from 'vitest';
import {
  createDocument,
  createNode,
  cloneNode,
  findNodeLocation,
  insertNodeInTree,
  removeNodeFromTree,
} from '../src/index.js';

describe('nodes', () => {
  it('findNodeLocation returns parent and index', () => {
    const root = createDocument().root;
    const button = createNode('Button', {}, [], 'btn1');
    const card = createNode('Card', {}, [button], 'card1');
    root.children = [card];

    const location = findNodeLocation(root, 'btn1');
    expect(location?.parent?.id).toBe('card1');
    expect(location?.index).toBe(0);
    expect(location?.node.id).toBe('btn1');
  });

  it('findNodeLocation returns null parent for root', () => {
    const root = createDocument().root;
    const location = findNodeLocation(root, 'root');
    expect(location?.parent).toBeNull();
    expect(location?.index).toBe(-1);
  });

  it('cloneNode regenerates ids', () => {
    const node = createNode('Button', { children: 'Hi' }, [createNode('Icon', {}, [], 'icon1')], 'btn1');
    let counter = 0;
    const cloned = cloneNode(node, () => `new-${++counter}`);
    expect(cloned.id).toBe('new-1');
    expect(cloned.type).toBe('Button');
    expect(cloned.props).toEqual({ children: 'Hi' });
    expect(cloned.children?.[0].id).toBe('new-2');
    expect(cloned.children?.[0].id).not.toBe('icon1');
  });

  it('insertNodeInTree appends by default', () => {
    const root = createDocument().root;
    const a = createNode('Button', {}, [], 'a');
    const b = createNode('Button', {}, [], 'b');
    let updated = insertNodeInTree(root, 'root', a);
    updated = insertNodeInTree(updated, 'root', b);
    expect(updated.children?.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('removeNodeFromTree removes nested node', () => {
    const root = createDocument().root;
    const button = createNode('Button', {}, [], 'btn1');
    root.children = [createNode('Card', {}, [button], 'card1')];

    const updated = removeNodeFromTree(root, 'btn1');
    const card = updated.children?.[0];
    expect(card?.children).toHaveLength(0);
  });

  it('removeNodeFromTree throws when removing root', () => {
    const root = createDocument().root;
    expect(() => removeNodeFromTree(root, 'root')).toThrow(/Cannot remove root/);
  });
});
