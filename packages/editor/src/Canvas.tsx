import { useEffect, useRef } from 'react';
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import { useEditorState, useEditorStore } from './EditorContext.js';

export type CanvasProps = Record<string, never>;

export function Canvas(_props: CanvasProps) {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const registry = useEditorState((s) => s.registry);
  const selection = useEditorState((s) => s.selection);
  const studioMode = useEditorState((s) => s.studioMode);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const isEdit = studioMode === 'edit';

  useEffect(() => {
    const surface = surfaceRef.current;
    if (surface) {
      surface.scrollTop = scrollTopRef.current;
    }
  }, [studioMode]);

  const handleScroll = () => {
    if (surfaceRef.current) {
      scrollTopRef.current = surfaceRef.current.scrollTop;
    }
  };

  const isEmpty = !document.root.children || document.root.children.length === 0;

  return (
    <div
      className="vf-canvas"
      onClick={isEdit ? () => store.getState().clearSelection() : undefined}
      onDragOver={
        isEdit
          ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }
          : undefined
      }
      onDrop={
        isEdit
          ? (e) => {
              e.preventDefault();
              const type = e.dataTransfer.getData('application/viewfoundry-component');
              if (type) store.getState().insertComponent(type);
            }
          : undefined
      }
    >
      {isEdit && <div className="vf-panel-header">Canvas</div>}
      <div
        ref={surfaceRef}
        className={`vf-canvas-surface${isEdit ? '' : ' vf-canvas-surface--live'}`}
        onScroll={handleScroll}
      >
        {isEdit && isEmpty && (
          <div className="vf-canvas-empty">
            Drag components here or click an item in the palette
          </div>
        )}
        <ViewFoundryProvider
          document={document}
          registry={registry}
          selection={selection}
          mode={isEdit ? 'edit' : 'preview'}
          onSelectNode={isEdit ? (nodeId) => store.getState().selectNode(nodeId) : undefined}
        >
          <ViewRenderer />
        </ViewFoundryProvider>
      </div>
    </div>
  );
}
