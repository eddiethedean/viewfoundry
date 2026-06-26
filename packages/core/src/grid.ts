import type { GridPlacement, ViewNode } from './types.js';

export const GRID_CONTAINER_TYPES = ['Grid', 'Row'] as const;

export type GridContainerType = (typeof GRID_CONTAINER_TYPES)[number];

export type GridTracks = {
  columns: number;
  rows: number;
  gap: number;
  minRowHeight?: number | string;
};

export type PlacementRect = {
  column: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};

export function isGridContainer(type: string): type is GridContainerType {
  return (GRID_CONTAINER_TYPES as readonly string[]).includes(type);
}

export function normalizePlacement(placement?: GridPlacement): PlacementRect {
  return {
    column: placement?.column ?? 1,
    row: placement?.row ?? 1,
    colSpan: placement?.colSpan ?? 1,
    rowSpan: placement?.rowSpan ?? 1,
  };
}

export function resolveGridTracks(node: ViewNode): GridTracks {
  const props = node.props ?? {};
  const gap = typeof props.gap === 'number' ? props.gap : 8;
  const columns = typeof props.columns === 'number' && props.columns > 0 ? props.columns : 4;

  if (node.type === 'Row') {
    return { columns, rows: 1, gap };
  }

  const rows =
    typeof props.rows === 'number' && props.rows > 0 ? props.rows : inferRowCount(node.children);
  const minRowHeight =
    typeof props.minRowHeight === 'number' || typeof props.minRowHeight === 'string'
      ? props.minRowHeight
      : undefined;

  return { columns, rows, gap, minRowHeight };
}

function inferRowCount(children?: ViewNode[]): number {
  if (!children || children.length === 0) return 1;
  let maxRow = 1;
  for (const child of children) {
    const rect = normalizePlacement(child.layout?.grid);
    maxRow = Math.max(maxRow, rect.row + rect.rowSpan - 1);
  }
  return maxRow;
}

export function placementToRect(placement?: GridPlacement): PlacementRect {
  return normalizePlacement(placement);
}

export function rectsOverlap(a: PlacementRect, b: PlacementRect): boolean {
  const aColEnd = a.column + a.colSpan - 1;
  const aRowEnd = a.row + a.rowSpan - 1;
  const bColEnd = b.column + b.colSpan - 1;
  const bRowEnd = b.row + b.rowSpan - 1;
  return a.column <= bColEnd && aColEnd >= b.column && a.row <= bRowEnd && aRowEnd >= b.row;
}

export function sortChildrenByGridOrder(children: ViewNode[]): ViewNode[] {
  return [...children].sort((a, b) => {
    const aRect = normalizePlacement(a.layout?.grid);
    const bRect = normalizePlacement(b.layout?.grid);
    if (aRect.row !== bRect.row) return aRect.row - bRect.row;
    if (aRect.column !== bRect.column) return aRect.column - bRect.column;
    return 0;
  });
}

export function autoPlaceNextCell(existingChildren: ViewNode[], tracks: GridTracks): GridPlacement {
  const occupied = existingChildren.map((child) => normalizePlacement(child.layout?.grid));

  for (let row = 1; row <= tracks.rows; row++) {
    for (let column = 1; column <= tracks.columns; column++) {
      const candidate: PlacementRect = { column, row, colSpan: 1, rowSpan: 1 };
      const overlaps = occupied.some((rect) => rectsOverlap(candidate, rect));
      if (!overlaps) {
        return { column, row, colSpan: 1, rowSpan: 1 };
      }
    }
  }

  const nextRow = tracks.rows + 1;
  return { column: 1, row: nextRow, colSpan: 1, rowSpan: 1 };
}

export function placementToCss(placement?: GridPlacement): Record<string, string> {
  const rect = normalizePlacement(placement);
  const colEnd = rect.column + rect.colSpan;
  const rowEnd = rect.row + rect.rowSpan;
  const gridColumn = rect.colSpan > 1 ? `${rect.column} / ${colEnd}` : String(rect.column);
  const gridRow = rect.rowSpan > 1 ? `${rect.row} / ${rowEnd}` : String(rect.row);
  return { gridColumn, gridRow };
}

export function gridContainerStyle(tracks: GridTracks): Record<string, string | number> {
  const style: Record<string, string | number> = {
    display: 'grid',
    gridTemplateColumns: `repeat(${tracks.columns}, minmax(0, 1fr))`,
    gridTemplateRows: tracks.rows > 0 ? `repeat(${tracks.rows}, minmax(0, auto))` : 'auto',
    gap: tracks.gap,
  };
  if (tracks.minRowHeight !== undefined) {
    style.minHeight = tracks.minRowHeight;
  }
  return style;
}

export function isPlacementInBounds(rect: PlacementRect, tracks: GridTracks): boolean {
  if (rect.column < 1 || rect.row < 1 || rect.colSpan < 1 || rect.rowSpan < 1) {
    return false;
  }
  if (rect.column + rect.colSpan - 1 > tracks.columns) {
    return false;
  }
  if (tracks.rows > 0 && rect.row + rect.rowSpan - 1 > tracks.rows) {
    return false;
  }
  return true;
}

export function parseGridDropId(
  id: string,
): { parentId: string; row: number; column: number } | null {
  const match = /^grid:([^:]+):(\d+):(\d+)$/.exec(id);
  if (!match) return null;
  return {
    parentId: match[1]!,
    row: Number(match[2]),
    column: Number(match[3]),
  };
}

export function gridDropId(parentId: string, row: number, column: number): string {
  return `grid:${parentId}:${row}:${column}`;
}
