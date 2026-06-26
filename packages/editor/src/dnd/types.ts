export type PaletteDragData = {
  kind: 'palette';
  componentType: string;
};

export type NodeDragData = {
  kind: 'node';
  nodeId: string;
  nodeType: string;
};

export type GridCellDragData = {
  kind: 'grid-cell';
  parentId: string;
  row: number;
  column: number;
};

export type DragData = PaletteDragData | NodeDragData;

export function paletteDragId(componentType: string): string {
  return `palette:${componentType}`;
}

export function nodeDragId(nodeId: string): string {
  return `node:${nodeId}`;
}

export function parsePaletteDragId(id: string): string | null {
  return id.startsWith('palette:') ? id.slice('palette:'.length) : null;
}

export function parseNodeDragId(id: string): string | null {
  return id.startsWith('node:') ? id.slice('node:'.length) : null;
}
