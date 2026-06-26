import { describe, expect, it } from 'vitest';
import { applyCommand } from './apply-command.js';
import { createDocument, createNode } from './document.js';
import { createRegistry } from './registry.js';

const buttonDef = {
  type: 'Button',
  label: 'Button',
  component: () => null,
  acceptsChildren: false,
};

const cardDef = {
  type: 'Card',
  label: 'Card',
  component: () => null,
  acceptsChildren: true,
  allowedChildren: ['Button'],
};

describe('applyCommand', () => {
  const registry = createRegistry([buttonDef, cardDef]);

  it('rejects insert when parent does not accept children', () => {
    const document = createDocument({
      root: {
        id: 'root',
        type: 'Root',
        children: [createNode('Button', { children: 'Click' }, [], 'btn-1')],
      },
    });
    const node = createNode('Button', { children: 'Nested' });
    const result = applyCommand(
      document,
      { type: 'insertNode', payload: { parentId: 'btn-1', node } },
      registry,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('does not accept children');
    }
  });

  it('rejects insert when child type is not allowed', () => {
    const document = createDocument({
      root: {
        id: 'root',
        type: 'Root',
        children: [
          {
            id: 'card-1',
            type: 'Card',
            props: { title: 'Card' },
            children: [],
          },
        ],
      },
    });
    const node = createNode('Card', { title: 'Nested' });
    const result = applyCommand(
      document,
      { type: 'insertNode', payload: { parentId: 'card-1', node } },
      registry,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('not allowed');
    }
  });

  it('allows valid insert into accepting container', () => {
    const document = createDocument({
      root: {
        id: 'root',
        type: 'Root',
        children: [
          {
            id: 'card-1',
            type: 'Card',
            props: { title: 'Card' },
            children: [],
          },
        ],
      },
    });
    const node = createNode('Button', { children: 'Click' });
    const result = applyCommand(
      document,
      { type: 'insertNode', payload: { parentId: 'card-1', node } },
      registry,
    );
    expect(result.ok).toBe(true);
  });

  it('validates document structure after delete', () => {
    const document = createDocument({
      root: {
        id: 'root',
        type: 'Root',
        children: [createNode('Button', { children: 'Click' })],
      },
    });
    const nodeId = document.root.children![0].id;
    const result = applyCommand(document, { type: 'deleteNode', payload: { nodeId } }, registry);
    expect(result.ok).toBe(true);
  });
});
