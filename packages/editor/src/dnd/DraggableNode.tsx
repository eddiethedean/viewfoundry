import type { CSSProperties, ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { useDraggable } from '@dnd-kit/core';
import { getChildPlacementStyle, getGridPlacementClass } from '@viewfoundry/react';
import { nodeDragId, type NodeDragData } from './types.js';

export type DraggableNodeProps = {
  node: ViewNode;
  parent: ViewNode | null;
  children: ReactNode;
};

export function DraggableNode({ node, parent, children }: DraggableNodeProps) {
  const disabled = node.type === 'Root';
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: nodeDragId(node.id),
    disabled,
    data: {
      kind: 'node',
      nodeId: node.id,
      nodeType: node.type,
    } satisfies NodeDragData,
  });

  const placementStyle = getChildPlacementStyle(parent, node);
  const hasPlacement = Boolean(placementStyle && Object.keys(placementStyle).length > 0);
  const gridClass = getGridPlacementClass(parent);

  const shellStyle: CSSProperties = {
    position: 'relative',
    minHeight: 0,
    ...(hasPlacement ? placementStyle : {}),
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={
        `${isDragging ? 'vf-node-dragging' : ''}${hasPlacement ? ` vf-grid-placement${gridClass}` : ''}`.trim() ||
        undefined
      }
      style={shellStyle}
      data-drag-parent-type={parent?.type}
      data-node-id={hasPlacement ? node.id : undefined}
    >
      {children}
    </div>
  );
}
