import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import { useEditorState, useEditorStore } from './EditorContext.js';

export type CanvasProps = Record<string, never>;

export function Canvas(_props: CanvasProps) {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const registry = useEditorState((s) => s.registry);
  const selection = useEditorState((s) => s.selection);

  const isEmpty = !document.root.children || document.root.children.length === 0;

  return (
    <div
      className="vf-canvas"
      onClick={() => store.getState().clearSelection()}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/viewfoundry-component');
        if (type) store.getState().insertComponent(type, 'root');
      }}
    >
      <div className="vf-panel-header">Canvas</div>
      <div className="vf-canvas-surface">
        {isEmpty && (
          <div className="vf-canvas-empty">
            Drag components here or click an item in the palette
          </div>
        )}
        <ViewFoundryProvider
          document={document}
          registry={registry}
          selection={selection}
          mode="edit"
          onSelectNode={(nodeId) => store.getState().selectNode(nodeId)}
        >
          <ViewRenderer />
        </ViewFoundryProvider>
      </div>
    </div>
  );
}
