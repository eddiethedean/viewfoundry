import {
  findNode,
  findNodeLocation,
  getPrimarySelection,
  normalizePlacement,
  rectsOverlap,
  type SelectionState,
  type ViewDocument,
  type ViewNode,
} from '@viewfoundry/core';

export function findChildAtGridCell(
  gridNode: ViewNode,
  row: number,
  column: number,
): ViewNode | undefined {
  const cellRect = { column, row, colSpan: 1, rowSpan: 1 };
  for (const child of gridNode.children ?? []) {
    const childRect = normalizePlacement(child.layout?.grid);
    if (rectsOverlap(cellRect, childRect)) return child;
  }
  return undefined;
}

export function isGridCellSelected(
  gridNode: ViewNode,
  document: ViewDocument,
  selection: SelectionState,
  row: number,
  column: number,
): boolean {
  const selectedId = getPrimarySelection(selection);
  if (!selectedId) return false;

  const location = findNodeLocation(document.root, selectedId);
  if (location?.parent?.id !== gridNode.id) return false;

  const selected = findNode(document.root, selectedId);
  if (!selected?.layout?.grid) return false;

  const cellRect = { column, row, colSpan: 1, rowSpan: 1 };
  return rectsOverlap(normalizePlacement(selected.layout.grid), cellRect);
}
