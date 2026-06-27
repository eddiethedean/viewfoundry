import { useDndContext, useDroppable } from '@dnd-kit/core';
import { useEditorState } from '../EditorContext.js';
import { CANVAS_DROP_ID, parsePaletteDragId } from './types.js';

export function CanvasDropZone() {
  const { active } = useDndContext();
  const paletteType = active ? parsePaletteDragId(String(active.id)) : null;
  const isEmpty = useEditorState((s) => (s.document.root.children?.length ?? 0) === 0);

  const { setNodeRef, isOver } = useDroppable({
    id: CANVAS_DROP_ID,
    disabled: !paletteType,
    data: { kind: 'canvas' },
  });

  return (
    <div
      ref={setNodeRef}
      className={`vf-canvas-drop-zone${paletteType && isOver ? ' vf-canvas-drop-target' : ''}${isEmpty ? ' vf-canvas-drop-zone--empty' : ''}`}
      data-testid="vf-canvas-drop-zone"
      aria-hidden={!paletteType}
    />
  );
}
