import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { parseGridDropId } from '@viewfoundry/core';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useEditorStore } from '../EditorContext.js';
import { parseNodeDragId, parsePaletteDragId } from './types.js';

export type CanvasDndProviderProps = {
  children: ReactNode;
  renderDragOverlay?: (activeId: string | null) => ReactNode;
};

export function CanvasDndProvider({ children, renderDragOverlay }: CanvasDndProviderProps) {
  const store = useEditorStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshotRef = useRef<ReturnType<typeof store.getState>['document'] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      snapshotRef.current = store.getState().document;
      setActiveId(String(event.active.id));
    },
    [store],
  );

  const handleDragCancel = useCallback(() => {
    if (snapshotRef.current) {
      store.getState().setDocument(snapshotRef.current);
    }
    setActiveId(null);
    snapshotRef.current = null;
  }, [store]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      snapshotRef.current = null;

      if (!over) return;

      const cell = parseGridDropId(String(over.id));
      if (!cell) return;

      const layout = { column: cell.column, row: cell.row, colSpan: 1, rowSpan: 1 };
      const paletteType = parsePaletteDragId(String(active.id));
      if (paletteType) {
        store.getState().insertComponent(paletteType, {
          parentId: cell.parentId,
          layout,
        });
        return;
      }

      const nodeId = parseNodeDragId(String(active.id));
      if (nodeId) {
        store.getState().moveNodeToCell(nodeId, cell.parentId, layout);
      }
    },
    [store],
  );

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDragCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeId, handleDragCancel]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
        {renderDragOverlay?.(activeId)}
      </DragOverlay>
    </DndContext>
  );
}
