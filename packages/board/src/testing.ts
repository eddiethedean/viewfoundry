import { renderToStaticMarkup } from 'react-dom/server';
import { renderBoardElement } from './render.js';
import type { BoardDefinition } from './types.js';

export function renderBoardToString<TProps = Record<string, unknown>>(
  board: BoardDefinition<TProps>,
): string {
  return renderToStaticMarkup(renderBoardElement(board));
}
