import { describe, expect, it } from 'vitest';
import { createRegistry } from '@viewfoundry/core';
import { defineComponent, select, text } from '@viewfoundry/schema';
import { createBoard } from '@viewfoundry/board';
import { createCodeFirstStore } from './store.js';

const Button = ({ children, variant }: { children?: string; variant?: string }) => null;

const registry = createRegistry([
  defineComponent(Button, {
    type: 'Button',
    label: 'Button',
    props: {
      children: text({ defaultValue: 'Click' }),
      variant: select({ options: ['primary', 'secondary'], defaultValue: 'primary' }),
    },
  }),
]);

const FIXTURE = `
export function Demo() {
  return <Button variant="primary">Click</Button>;
}
`;

const board = createBoard({
  name: 'Button',
  component: Button,
  props: {},
  sourceFile: 'Demo.tsx',
});

describe('createCodeFirstStore', () => {
  it('updates prop in source via updateProp', () => {
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
    });

    const parsed = store.getState().parsed;
    const button = [...parsed!.elements.values()].find((e) => e.tagName === 'Button');
    expect(button).toBeDefined();

    store.getState().selectElement(button!.id);
    store.getState().updateProp('variant', 'secondary');

    expect(store.getState().sourceFiles['Demo.tsx']).toContain('secondary');
    expect(store.getState().canUndo()).toBe(true);
  });

  it('undo restores previous source', () => {
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
    });

    const button = [...store.getState().parsed!.elements.values()].find((e) => e.tagName === 'Button')!;
    store.getState().selectElement(button.id);
    store.getState().updateProp('variant', 'secondary');
    store.getState().undo();

    expect(store.getState().sourceFiles['Demo.tsx']).toContain('primary');
    expect(store.getState().canRedo()).toBe(true);
  });
});
