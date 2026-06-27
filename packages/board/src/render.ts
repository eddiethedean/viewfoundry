import { createElement, type ReactElement, type ComponentType } from 'react';
import type { BoardDefinition } from './types.js';

export function renderBoardElement<TProps = Record<string, unknown>>(
  board: BoardDefinition<TProps>,
): ReactElement {
  const Component = board.component;
  const inner = createElement(
    Component as ComponentType<Record<string, unknown>>,
    board.props as Record<string, unknown>,
  );
  if (board.wrapper) {
    const Wrapper = board.wrapper;
    return createElement(Wrapper, null, inner);
  }
  return inner;
}
