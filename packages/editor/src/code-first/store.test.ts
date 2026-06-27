import { describe, expect, it, vi } from 'vitest';
import { createRegistry } from '@viewfoundry/core';
import { defineComponent, select, text } from '@viewfoundry/schema';
import { createBoard } from '@viewfoundry/board';
import { createCodeFirstStore, filesSnapshot } from './store.js';

const Button = ({
  children: _children,
  variant: _variant,
}: {
  children?: string;
  variant?: string;
}) => null;

const Stack = ({ children: _children }: { children?: unknown }) => null;

const registry = createRegistry([
  defineComponent(Button, {
    type: 'Button',
    label: 'Button',
    props: {
      children: text({ defaultValue: 'Click' }),
      variant: select({ options: ['primary', 'secondary'], defaultValue: 'primary' }),
    },
  }),
  defineComponent(Stack, {
    type: 'Stack',
    label: 'Stack',
    acceptsChildren: true,
    props: {},
  }),
]);

const FIXTURE = `
export function Demo() {
  return (
    <Stack>
      <Button variant="primary">Click</Button>
    </Stack>
  );
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

    const button = [...store.getState().parsed!.elements.values()].find(
      (e) => e.tagName === 'Button',
    )!;
    store.getState().selectElement(button.id);
    store.getState().updateProp('variant', 'secondary');
    store.getState().undo();

    expect(store.getState().sourceFiles['Demo.tsx']).toContain('primary');
    expect(store.getState().canRedo()).toBe(true);
  });

  it('blocks delete of root element', () => {
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
    });
    const stack = [...store.getState().parsed!.elements.values()].find(
      (e) => e.tagName === 'Stack',
    )!;
    store.getState().selectElement(stack.id);
    store.getState().deleteSelected();
    expect(store.getState().lastError).toContain('root');
  });

  it('external sync resets file history', () => {
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
    });
    const button = [...store.getState().parsed!.elements.values()].find(
      (e) => e.tagName === 'Button',
    )!;
    store.getState().selectElement(button.id);
    store.getState().updateProp('variant', 'secondary');
    expect(store.getState().canUndo()).toBe(true);

    store.getState().syncSourceFiles({ 'Demo.tsx': FIXTURE }, 'Demo.tsx', true);
    expect(store.getState().canUndo()).toBe(false);
  });

  it('uses callback ref for onSourceFilesChange', () => {
    const onChange = vi.fn();
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
      getOnSourceFilesChange: () => onChange,
    });
    const button = [...store.getState().parsed!.elements.values()].find(
      (e) => e.tagName === 'Button',
    )!;
    store.getState().selectElement(button.id);
    store.getState().updateProp('variant', 'secondary');
    expect(onChange).toHaveBeenCalled();
    expect(filesSnapshot(onChange.mock.calls[0][0])).toBe(
      filesSnapshot(store.getState().sourceFiles),
    );
  });

  it('skips NaN number prop updates', () => {
    const store = createCodeFirstStore({
      registry,
      board,
      sourceFiles: { 'Demo.tsx': FIXTURE },
      activeSourceFile: 'Demo.tsx',
    });
    const before = store.getState().sourceFiles['Demo.tsx'];
    store.getState().updateProp('count', Number.NaN);
    expect(store.getState().sourceFiles['Demo.tsx']).toBe(before);
  });
});
