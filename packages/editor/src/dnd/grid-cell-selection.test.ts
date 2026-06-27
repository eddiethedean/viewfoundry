import { describe, expect, it } from 'vitest';
import { createDocument, createNode, createSelection, selectNode } from '@viewfoundry/core';
import { findChildAtGridCell, isGridCellSelected } from './grid-cell-selection.js';

describe('grid cell selection', () => {
  const grid = createNode(
    'Grid',
    { columns: 4, rows: 2 },
    [
      createNode('Button', {}, [], 'btn1', { grid: { column: 1, row: 1 } }),
      createNode('Text', {}, [], 'txt1', { grid: { column: 2, row: 1 } }),
    ],
    'grid1',
  );
  const document = createDocument({
    root: {
      id: 'root',
      type: 'Root',
      props: {},
      children: [grid],
    },
  });

  it('finds a child occupying a grid cell', () => {
    expect(findChildAtGridCell(grid, 1, 1)?.id).toBe('btn1');
    expect(findChildAtGridCell(grid, 1, 2)?.id).toBe('txt1');
    expect(findChildAtGridCell(grid, 1, 3)).toBeUndefined();
  });

  it('marks the cell containing the selected node', () => {
    const selection = selectNode(createSelection(), 'txt1');
    expect(isGridCellSelected(grid, document, selection, 1, 2)).toBe(true);
    expect(isGridCellSelected(grid, document, selection, 1, 1)).toBe(false);
  });
});
