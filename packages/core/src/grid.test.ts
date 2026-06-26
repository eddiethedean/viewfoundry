import { describe, expect, it } from 'vitest';
import { createNode } from './document.js';
import {
  autoPlaceNextCell,
  growGridRowsIfNeeded,
  gridDropId,
  isPlacementInBounds,
  MAX_GRID_CELLS,
  normalizePlacement,
  parseGridDropId,
  placementExceedsMaxTracks,
  placementToCss,
  rectsOverlap,
  resolveGridTracks,
  sortChildrenByGridOrder,
} from './grid.js';

describe('grid utilities', () => {
  it('normalizes placement defaults', () => {
    expect(normalizePlacement()).toEqual({ column: 1, row: 1, colSpan: 1, rowSpan: 1 });
    expect(normalizePlacement({ column: 2, row: 3, colSpan: 2 })).toEqual({
      column: 2,
      row: 3,
      colSpan: 2,
      rowSpan: 1,
    });
  });

  it('detects overlapping rects', () => {
    const a = normalizePlacement({ column: 1, row: 1, colSpan: 2, rowSpan: 1 });
    const b = normalizePlacement({ column: 2, row: 1, colSpan: 1, rowSpan: 1 });
    const c = normalizePlacement({ column: 3, row: 1, colSpan: 1, rowSpan: 1 });
    expect(rectsOverlap(a, b)).toBe(true);
    expect(rectsOverlap(a, c)).toBe(false);
  });

  it('sorts children row-major', () => {
    const children = [
      createNode('Button', {}, [], 'b2', { grid: { column: 2, row: 1 } }),
      createNode('Button', {}, [], 'b1', { grid: { column: 1, row: 1 } }),
      createNode('Button', {}, [], 'b3', { grid: { column: 1, row: 2 } }),
    ];
    expect(sortChildrenByGridOrder(children).map((c) => c.id)).toEqual(['b1', 'b2', 'b3']);
  });

  it('auto-places next free cell', () => {
    const grid = createNode('Grid', { columns: 2, rows: 2 });
    const tracks = resolveGridTracks(grid);
    const children = [
      createNode('Button', {}, [], 'b1', { grid: { column: 1, row: 1 } }),
      createNode('Button', {}, [], 'b2', { grid: { column: 2, row: 1 } }),
    ];
    expect(autoPlaceNextCell(children, tracks)).toEqual({
      column: 1,
      row: 2,
      colSpan: 1,
      rowSpan: 1,
    });
  });

  it('growGridRowsIfNeeded expands explicit rows when placement exceeds bounds', () => {
    const grid = createNode('Grid', { columns: 2, rows: 2 }, [], 'grid1');
    const grown = growGridRowsIfNeeded(grid, 'grid1', { column: 1, row: 3 });
    expect(grown.props?.rows).toBe(3);
  });

  it('resolves grid tracks from props', () => {
    const grid = createNode('Grid', { columns: 6, rows: 3, gap: 16, minRowHeight: 48 });
    expect(resolveGridTracks(grid)).toEqual({
      columns: 6,
      rows: 3,
      gap: 16,
      minRowHeight: 48,
    });
    const row = createNode('Row', { columns: 3, gap: 4 });
    expect(resolveGridTracks(row)).toEqual({ columns: 3, rows: 1, gap: 4 });
  });

  it('converts placement to CSS grid properties', () => {
    expect(placementToCss({ column: 1, row: 1 })).toEqual({
      gridColumn: '1',
      gridRow: '1',
    });
    expect(placementToCss({ column: 2, row: 1, colSpan: 2 })).toEqual({
      gridColumn: '2 / 4',
      gridRow: '1',
    });
  });

  it('checks placement bounds', () => {
    const tracks = { columns: 4, rows: 2, gap: 8 };
    expect(isPlacementInBounds(normalizePlacement({ column: 1, row: 1 }), tracks)).toBe(true);
    expect(isPlacementInBounds(normalizePlacement({ column: 3, row: 1, colSpan: 2 }), tracks)).toBe(
      true,
    );
    expect(isPlacementInBounds(normalizePlacement({ column: 4, row: 1, colSpan: 2 }), tracks)).toBe(
      false,
    );
  });

  it('auto-places next column when a row container is full', () => {
    const row = createNode('Row', { columns: 2 });
    const tracks = resolveGridTracks(row);
    const children = [
      createNode('Button', {}, [], 'b1', { grid: { column: 1, row: 1 } }),
      createNode('Button', {}, [], 'b2', { grid: { column: 2, row: 1 } }),
    ];
    expect(autoPlaceNextCell(children, tracks)).toEqual({
      column: 3,
      row: 1,
      colSpan: 1,
      rowSpan: 1,
    });
  });

  it('growGridRowsIfNeeded expands row columns when placement exceeds width', () => {
    const row = createNode('Row', { columns: 2 }, [], 'row1');
    const grown = growGridRowsIfNeeded(row, 'row1', { column: 3, row: 1 });
    expect(grown.props?.columns).toBe(3);
  });

  it('parses grid drop ids', () => {
    expect(gridDropId('grid1', 2, 3)).toBe('grid:grid1:2:3');
    expect(parseGridDropId('grid:grid1:2:3')).toEqual({
      parentId: 'grid1',
      row: 2,
      column: 3,
    });
    expect(parseGridDropId('invalid')).toBeNull();
  });

  it('caps growGridRowsIfNeeded at MAX_GRID_CELLS', () => {
    const grid = createNode('Grid', { columns: 4, rows: 60 }, [], 'grid1');
    const grown = growGridRowsIfNeeded(grid, 'grid1', { column: 1, row: 70 });
    expect(grown.props?.rows).toBe(MAX_GRID_CELLS);
  });

  it('detects placement exceeding MAX_GRID_CELLS', () => {
    expect(placementExceedsMaxTracks('Grid', { column: 1, row: 65 })).toBe(true);
    expect(placementExceedsMaxTracks('Grid', { column: 1, row: 64 })).toBe(false);
  });
});
