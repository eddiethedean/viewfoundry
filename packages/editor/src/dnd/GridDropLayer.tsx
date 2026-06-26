import { useDndContext } from '@dnd-kit/core';
import type { CSSProperties, ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { gridContainerStyle, resolveGridTracks } from '@viewfoundry/core';
import { GridCellDroppable } from './GridCellDroppable.js';
import { parseNodeDragId, parsePaletteDragId } from './types.js';

const MAX_GRID_CELLS = 12;

export type GridDropLayerProps = {
  node: ViewNode;
  activeCell?: { row: number; column: number } | null;
  canDrop?: (componentType: string) => boolean;
};

export function GridDropLayer({ node, activeCell, canDrop }: GridDropLayerProps) {
  const { active } = useDndContext();
  let draggingType: string | null = null;
  if (active) {
    draggingType =
      parsePaletteDragId(String(active.id)) ??
      (parseNodeDragId(String(active.id))
        ? ((active.data.current as { nodeType?: string } | undefined)?.nodeType ?? null)
        : null);
  }
  const tracks = resolveGridTracks(node);
  const columns = Math.min(tracks.columns, MAX_GRID_CELLS);
  const rows = Math.min(Math.max(tracks.rows, 1), MAX_GRID_CELLS);
  const layerStyle: CSSProperties = {
    ...gridContainerStyle({ ...tracks, columns, rows }),
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 2,
  };

  const cells: ReactNode[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let column = 1; column <= columns; column++) {
      const disabled = draggingType ? (canDrop ? !canDrop(draggingType) : false) : false;
      cells.push(
        <GridCellDroppable
          key={`${row}-${column}`}
          parentId={node.id}
          row={row}
          column={column}
          active={activeCell?.row === row && activeCell?.column === column}
          disabled={disabled}
        />,
      );
    }
  }

  return (
    <div className="vf-grid-drop-layer" style={layerStyle}>
      {cells}
    </div>
  );
}
