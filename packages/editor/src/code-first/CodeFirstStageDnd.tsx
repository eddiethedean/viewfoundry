import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { validateAllowedChild } from '@viewfoundry/sync';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

export const CF_DRAG_PREFIX = 'cf-drag:';
export const CF_DROP_PREFIX = 'cf-drop:';

export function parseCfDragId(id: string): string | null {
  return id.startsWith(CF_DRAG_PREFIX) ? id.slice(CF_DRAG_PREFIX.length) : null;
}

export function parseCfDropId(id: string): { parentId: string; index: number } | null {
  if (!id.startsWith(CF_DROP_PREFIX)) return null;
  const rest = id.slice(CF_DROP_PREFIX.length);
  const sep = rest.lastIndexOf(':');
  if (sep < 0) return null;
  const parentId = rest.slice(0, sep);
  const index = Number(rest.slice(sep + 1));
  if (Number.isNaN(index)) return null;
  return { parentId, index };
}

export function formatCfDragId(elementId: string): string {
  return `${CF_DRAG_PREFIX}${elementId}`;
}

export function formatCfDropId(parentId: string, index: number): string {
  return `${CF_DROP_PREFIX}${parentId}:${index}`;
}

function DropSlot({ parentId, index }: { parentId: string; index: number }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: formatCfDropId(parentId, index) });
  const showHighlight = isOver && active !== null;

  return (
    <div
      ref={setNodeRef}
      className={`vf-cf-drop-slot${showHighlight ? ' vf-cf-drop-slot--active' : ''}`}
      data-testid={`cf-drop-${parentId}-${index}`}
    />
  );
}

function DraggableElement({
  elementId,
  tagName,
  children,
}: {
  elementId: string;
  tagName: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: formatCfDragId(elementId),
  });

  return (
    <div
      ref={setNodeRef}
      className={`vf-cf-draggable${isDragging ? ' vf-cf-draggable--dragging' : ''}`}
      data-vf-element-id={elementId}
      data-vf-tag={tagName}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export type CodeFirstStageDndProps = {
  children: ReactNode;
};

export function CodeFirstStageDnd({ children }: CodeFirstStageDndProps) {
  const store = useCodeFirstStore();
  const registry = useCodeFirstState((s) => s.registry);
  const parsed = useCodeFirstState((s) => s.parsed);
  const studioMode = useCodeFirstState((s) => s.studioMode);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTag, setDragTag] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      if (studioMode !== 'edit') return;
      const id = String(event.active.id);
      const elementId = parseCfDragId(id);
      if (!elementId || !parsed) return;
      setActiveId(id);
      setDragTag(parsed.elements.get(elementId)?.tagName ?? null);
      store.getState().setDragging(true);
    },
    [parsed, store, studioMode],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      setDragTag(null);
      store.getState().setDragging(false);

      if (studioMode !== 'edit' || !parsed) return;
      const elementId = parseCfDragId(String(event.active.id));
      const overId = event.over?.id ? String(event.over.id) : null;
      if (!elementId || !overId) return;

      const drop = parseCfDropId(overId);
      if (!drop) return;

      const el = parsed.elements.get(elementId);
      const parent = parsed.elements.get(drop.parentId);
      if (!el || !parent) return;

      const parentDef = registry.get(parent.tagName);
      const childDef = registry.get(el.tagName);
      const validation = validateAllowedChild(
        parent.tagName,
        el.tagName,
        parentDef?.allowedChildren,
        parentDef?.label,
        childDef?.label,
      );
      if (validation !== null && !validation.ok) {
        store.setState({ lastError: validation.error });
        return;
      }

      store.getState().moveElement(elementId, drop.parentId, drop.index);
    },
    [parsed, registry, store, studioMode],
  );

  const onDragCancel = useCallback(() => {
    setActiveId(null);
    setDragTag(null);
    store.getState().setDragging(false);
  }, [store]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeId) onDragCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, onDragCancel]);

  if (studioMode !== 'edit') {
    return <>{children}</>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 150 }}>
        {activeId && dragTag ? (
          <div className="vf-cf-drag-ghost" data-testid="cf-drag-ghost">
            {dragTag}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export { DraggableElement, DropSlot };
