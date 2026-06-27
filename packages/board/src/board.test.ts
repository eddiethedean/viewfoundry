import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { createBoard } from './types.js';
import { renderBoardElement } from './render.js';
import { renderBoardToString } from './testing.js';

function Button({ children }: { children?: string }) {
  return createElement('button', { type: 'button' }, children);
}

describe('createBoard', () => {
  it('creates a board definition with defaults', () => {
    const board = createBoard({
      name: 'Button',
      component: Button,
      props: { children: 'Hi' },
    });
    expect(board.name).toBe('Button');
    expect(board.viewport.width).toBe(360);
    expect(board.props.children).toBe('Hi');
  });

  it('renders board element', () => {
    const board = createBoard({
      name: 'Button',
      component: Button,
      props: { children: 'Click' },
    });
    const el = renderBoardElement(board);
    expect(el).toBeDefined();
  });

  it('renders static markup for tests', () => {
    const board = createBoard({
      name: 'Button',
      component: Button,
      props: { children: 'Click' },
    });
    expect(renderBoardToString(board)).toContain('Click');
  });
});
