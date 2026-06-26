import { useDroppable } from '@dnd-kit/core';
import { gridDropId } from '@viewfoundry/core';

export type GridCellDroppableProps = {
  parentId: string;
  row: number;
  column: number;
  active?: boolean;
  disabled?: boolean;
};

export function GridCellDroppable({
  parentId,
  row,
  column,
  active = false,
  disabled = false,
}: GridCellDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: gridDropId(parentId, row, column),
    disabled,
    data: { kind: 'grid-cell', parentId, row, column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`vf-grid-cell-drop${active || isOver ? ' vf-grid-drop-target' : ''}`}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      role="button"
      aria-label={`Drop at row ${row}, column ${column}`}
      data-grid-row={row}
      data-grid-column={column}
    />
  );
}
