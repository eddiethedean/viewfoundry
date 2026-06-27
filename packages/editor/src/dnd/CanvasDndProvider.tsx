import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Collision,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  parseGridDropId,
  findNode,
  findNodeLocation,
  isGridContainer,
  resolveGridTracks,
  isPlacementInBounds,
  normalizePlacement,
} from '@viewfoundry/core';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useEditorStore } from '../EditorContext.js';
import { parseCanvasDropId, parseNodeDragId, parsePaletteDragId } from './types.js';

export type CanvasDndProviderProps = {
  children: ReactNode;
  renderDragOverlay?: (activeId: string | null) => ReactNode;
};

function filterCollisionsForDrag(activeId: UniqueIdentifier, collisions: Collision[]): Collision[] {
  const activeStr = String(activeId);
  const isPaletteDrag = parsePaletteDragId(activeStr) !== null;
  const isNodeDrag = parseNodeDragId(activeStr) !== null;

  const filtered = collisions.filter(({ id }) => {
    const idStr = String(id);
    if (isPaletteDrag) {
      return parseCanvasDropId(idStr) || parseGridDropId(idStr) !== null;
    }
    if (isNodeDrag) {
      return parseGridDropId(idStr) !== null;
    }
    return true;
  });

  if (!isPaletteDrag) return filtered;

  const gridCells = filtered.filter(({ id }) => parseGridDropId(String(id)) !== null);
  if (gridCells.length > 0) return gridCells;

  return filtered.filter(({ id }) => parseCanvasDropId(String(id)));
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const filteredPointer = filterCollisionsForDrag(args.active.id, pointerCollisions);
  if (filteredPointer.length > 0) return filteredPointer;

  const rectCollisions = rectIntersection(args);
  return filterCollisionsForDrag(args.active.id, rectCollisions);
};

function resolvePaletteInsertTarget(
  document: ReturnType<ReturnType<typeof useEditorStore>['getState']>['document'],
  overId: string,
): {
  parentId: string;
  layout?: { column: number; row: number; colSpan: number; rowSpan: number };
} | null {
  const cell = parseGridDropId(overId);
  if (cell) {
    return {
      parentId: cell.parentId,
      layout: { column: cell.column, row: cell.row, colSpan: 1, rowSpan: 1 },
    };
  }

  if (parseCanvasDropId(overId)) {
    return { parentId: 'root' };
  }

  const overNodeId = parseNodeDragId(overId);
  if (!overNodeId) return null;

  const overNode = findNode(document.root, overNodeId);
  if (overNode && isGridContainer(overNode.type)) {
    return { parentId: overNode.id };
  }

  const location = findNodeLocation(document.root, overNodeId);
  if (location?.parent && isGridContainer(location.parent.type)) {
    return { parentId: location.parent.id };
  }

  return null;
}

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
      store.getState().setDragging(true);
      setActiveId(String(event.active.id));
    },
    [store],
  );

  const handleDragCancel = useCallback(() => {
    if (snapshotRef.current) {
      store.getState().revertDocument(snapshotRef.current);
    }
    store.getState().setDragging(false);
    setActiveId(null);
    snapshotRef.current = null;
  }, [store]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      store.getState().setDragging(false);
      setActiveId(null);
      snapshotRef.current = null;

      if (!over) return;

      const overId = String(over.id);
      const paletteType = parsePaletteDragId(String(active.id));

      if (paletteType) {
        const target = resolvePaletteInsertTarget(store.getState().document, overId);
        if (target) {
          store
            .getState()
            .insertComponent(
              paletteType,
              target.layout
                ? { parentId: target.parentId, layout: target.layout }
                : { parentId: target.parentId === 'root' ? undefined : target.parentId },
            );
        }
        return;
      }

      const cell = parseGridDropId(overId);
      if (!cell) return;

      const layout = { column: cell.column, row: cell.row, colSpan: 1, rowSpan: 1 };
      const nodeId = parseNodeDragId(String(active.id));
      if (nodeId) {
        const document = store.getState().document;
        const node = findNode(document.root, nodeId);
        const parent = findNode(document.root, cell.parentId);
        const existingGrid = node?.layout?.grid;
        let moveLayout = {
          column: cell.column,
          row: cell.row,
          colSpan: existingGrid?.colSpan ?? 1,
          rowSpan: existingGrid?.rowSpan ?? 1,
        };
        if (parent) {
          const tracks = resolveGridTracks(parent);
          const rect = normalizePlacement(moveLayout);
          if (!isPlacementInBounds(rect, tracks)) {
            moveLayout = {
              ...moveLayout,
              colSpan: Math.min(moveLayout.colSpan, tracks.columns),
              rowSpan: Math.min(moveLayout.rowSpan, tracks.rows),
            };
            const clamped = normalizePlacement(moveLayout);
            if (!isPlacementInBounds(clamped, tracks)) {
              moveLayout = { column: cell.column, row: cell.row, colSpan: 1, rowSpan: 1 };
            }
          }
        }
        store.getState().moveNodeToCell(nodeId, cell.parentId, moveLayout);
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
      collisionDetection={collisionDetection}
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
