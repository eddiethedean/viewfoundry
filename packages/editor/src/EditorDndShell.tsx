import { useCallback, type ReactNode } from 'react';
import { findNode } from '@viewfoundry/core';
import { useEditorState } from './EditorContext.js';
import { CanvasDndProvider } from './dnd/CanvasDndProvider.js';
import { parseNodeDragId, parsePaletteDragId } from './dnd/types.js';

export type EditorDndShellProps = {
  children: ReactNode;
};

export function EditorDndShell({ children }: EditorDndShellProps) {
  const registry = useEditorState((s) => s.registry);
  const document = useEditorState((s) => s.document);
  const studioMode = useEditorState((s) => s.studioMode);

  const renderDragOverlay = useCallback(
    (activeId: string | null) => {
      if (!activeId) return null;
      const paletteType = parsePaletteDragId(activeId);
      if (paletteType) {
        const def = registry.get(paletteType);
        return <div className="vf-drag-ghost">{def?.label ?? paletteType}</div>;
      }
      const nodeId = parseNodeDragId(activeId);
      if (nodeId) {
        const node = findNode(document.root, nodeId);
        return <div className="vf-drag-ghost">{node?.type ?? 'Node'}</div>;
      }
      return null;
    },
    [document.root, registry],
  );

  if (studioMode !== 'edit') {
    return children;
  }

  return <CanvasDndProvider renderDragOverlay={renderDragOverlay}>{children}</CanvasDndProvider>;
}
