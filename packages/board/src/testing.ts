import { renderToStaticMarkup } from 'react-dom/server';
import { renderBoardElement } from './render.js';
import type { BoardDefinition } from './types.js';

export function renderBoardToString(board: BoardDefinition): string {
  return renderToStaticMarkup(renderBoardElement(board));
}
