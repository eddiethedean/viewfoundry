import { useDraggable } from '@dnd-kit/core';
import { useEditorState, useEditorStore } from './EditorContext.js';
import { paletteDragId } from './dnd/types.js';

export type PaletteItemProps = {
  type: string;
  label: string;
  description?: string;
};

export function PaletteItem({ type, label, description }: PaletteItemProps) {
  const store = useEditorStore();
  const studioMode = useEditorState((s) => s.studioMode);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: paletteDragId(type),
    disabled: studioMode !== 'edit',
    data: { kind: 'palette', componentType: type },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`vf-palette-item${isDragging ? ' vf-palette-item--dragging' : ''}`}
      {...listeners}
      {...attributes}
      onClick={() => store.getState().insertComponent(type)}
    >
      <span className="vf-palette-item-label">{label}</span>
      {description && <span className="vf-palette-item-desc">{description}</span>}
    </button>
  );
}
