import { useDroppable } from '@dnd-kit/core';
import { gridDropId } from '@viewfoundry/core';

export type GridCellDroppableProps = {
  parentId: string;
  row: number;
  column: number;
  active?: boolean;
  disabled?: boolean;
  showGrid?: boolean;
  isDragActive?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function GridCellDroppable({
  parentId,
  row,
  column,
  active = false,
  disabled = false,
  showGrid = false,
  isDragActive = false,
  selected = false,
  onSelect,
}: GridCellDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: gridDropId(parentId, row, column),
    disabled,
    data: { kind: 'grid-cell', parentId, row, column },
  });

  const isDropTarget = active || isOver;
  const pointerEvents = (showGrid || isDragActive) && !disabled ? 'auto' : 'none';

  return (
    <div
      ref={setNodeRef}
      className={[
        'vf-grid-cell-drop',
        showGrid ? 'vf-grid-cell-drop--visible' : '',
        selected ? 'vf-grid-cell-drop--selected' : '',
        isDropTarget ? 'vf-grid-drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ pointerEvents }}
      role="button"
      aria-label={`Grid cell row ${row}, column ${column}`}
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      data-grid-row={row}
      data-grid-column={column}
      onClick={(event) => {
        if (!showGrid || disabled || isDragActive) return;
        event.stopPropagation();
        onSelect?.();
      }}
    />
  );
}
