import { useDndContext } from '@dnd-kit/core';
import type { CSSProperties, ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { gridContainerStyle, MAX_GRID_CELLS, resolveGridTracks } from '@viewfoundry/core';
import { useEditorState, useEditorStore } from '../EditorContext.js';
import { GridCellDroppable } from './GridCellDroppable.js';
import { findChildAtGridCell, isGridCellSelected } from './grid-cell-selection.js';
import { parseNodeDragId, parsePaletteDragId } from './types.js';

export { MAX_GRID_CELLS };

export type GridDropLayerProps = {
  node: ViewNode;
  activeCell?: { row: number; column: number } | null;
  canDrop?: (componentType: string) => boolean;
};

export function GridDropLayer({ node, activeCell, canDrop }: GridDropLayerProps) {
  const { active } = useDndContext();
  const store = useEditorStore();
  const showGrid = useEditorState((s) => s.showGrid);
  const document = useEditorState((s) => s.document);
  const selection = useEditorState((s) => s.selection);

  let draggingType: string | null = null;
  if (active) {
    draggingType =
      parsePaletteDragId(String(active.id)) ??
      (parseNodeDragId(String(active.id))
        ? ((active.data.current as { nodeType?: string } | undefined)?.nodeType ?? null)
        : null);
  }
  const tracks = resolveGridTracks(node);
  const columns = Math.min(Math.max(tracks.columns, 1), MAX_GRID_CELLS);
  const rows = Math.min(Math.max(tracks.rows, 1), MAX_GRID_CELLS);
  const layerStyle: CSSProperties = {
    ...gridContainerStyle({ ...tracks, columns, rows }),
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
  };

  const isDragActive = Boolean(active);

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
          showGrid={showGrid}
          isDragActive={isDragActive}
          selected={isGridCellSelected(node, document, selection, row, column)}
          onSelect={() => {
            const child = findChildAtGridCell(node, row, column);
            store.getState().selectNode(child?.id ?? node.id);
          }}
        />,
      );
    }
  }

  return (
    <div
      className={`vf-grid-drop-layer${showGrid ? ' vf-grid-drop-layer--visible' : ''}`}
      style={layerStyle}
    >
      {cells}
    </div>
  );
}
