import { useCallback } from 'react';
import { useEditorState } from './EditorContext.js';
import { CanvasSurface, type CanvasSurfaceProps } from './CanvasSurface.js';
import { DraggableNode } from './dnd/DraggableNode.js';
import { GridDropLayer } from './dnd/GridDropLayer.js';

export type CanvasProps = Record<string, never>;

export function Canvas(_props: CanvasProps) {
  const registry = useEditorState((s) => s.registry);
  const studioMode = useEditorState((s) => s.studioMode);
  const isEdit = studioMode === 'edit';

  const wrapEditNode = useCallback<NonNullable<CanvasSurfaceProps['wrapEditNode']>>(
    (node, element, parent) => (
      <DraggableNode node={node} parent={parent}>
        {element}
      </DraggableNode>
    ),
    [],
  );

  const renderGridDropLayer = useCallback<NonNullable<CanvasSurfaceProps['renderGridDropLayer']>>(
    (node) => (
      <GridDropLayer
        node={node}
        canDrop={(componentType) => {
          const def = registry.get(node.type);
          if (def?.acceptsChildren === false) return false;
          if (!def?.allowedChildren) return true;
          return def.allowedChildren.includes(componentType);
        }}
      />
    ),
    [registry],
  );

  return (
    <CanvasSurface
      wrapEditNode={isEdit ? wrapEditNode : undefined}
      renderGridDropLayer={isEdit ? renderGridDropLayer : undefined}
    />
  );
}
