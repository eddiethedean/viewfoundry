import { findNode, isGridContainer, sortChildrenByGridOrder } from '@viewfoundry/core';
import { useEditorState, useEditorStore } from './EditorContext.js';

function LayerItem({ nodeId, depth }: { nodeId: string; depth: number }) {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const selection = useEditorState((s) => s.selection);
  const node = findNode(document.root, nodeId);

  if (!node) return null;

  const isSelected = selection.selectedNodeIds.includes(nodeId);
  const canRemove = nodeId !== 'root';
  const hasChildren = node.children && node.children.length > 0;
  const orderedChildren =
    hasChildren && isGridContainer(node.type)
      ? sortChildrenByGridOrder(node.children!)
      : node.children;

  return (
    <>
      <div
        className={`vf-layer-row${isSelected ? ' vf-layer-row-selected' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <button
          type="button"
          className={`vf-layer-item${isSelected ? ' vf-layer-item-selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            store.getState().selectNode(nodeId);
          }}
        >
          <span className="vf-layer-item-label">
            {node.type}
            {node.layout?.grid && (
              <span className="vf-layer-item-grid">
                r{node.layout.grid.row ?? 1}c{node.layout.grid.column ?? 1}
              </span>
            )}
          </span>
          <span className="vf-layer-item-id">{node.id}</span>
        </button>
        {canRemove && (
          <button
            type="button"
            className="vf-layer-item-remove"
            aria-label={`Remove ${node.type} from layers`}
            onClick={(e) => {
              e.stopPropagation();
              store.getState().selectNode(nodeId);
              store.getState().deleteSelected();
            }}
          >
            Remove
          </button>
        )}
      </div>
      {orderedChildren?.map((child) => (
        <LayerItem key={child.id} nodeId={child.id} depth={depth + 1} />
      ))}
    </>
  );
}

export type LayersPanelProps = Record<string, never>;

export function LayersPanel(_props: LayersPanelProps) {
  return (
    <div className="vf-layers">
      <div className="vf-panel-header">Layers</div>
      <div className="vf-layers-tree">
        <LayerItem nodeId="root" depth={0} />
      </div>
    </div>
  );
}
