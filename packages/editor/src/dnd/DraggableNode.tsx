import type { ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { useDraggable } from '@dnd-kit/core';
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? 'vf-node-dragging' : undefined}
      style={{ position: 'relative', minHeight: 0 }}
      data-drag-parent-type={parent?.type}
    >
      {children}
    </div>
  );
}
