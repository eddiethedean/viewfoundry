import { useEffect, useRef } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import { useEditorState, useEditorStore } from './EditorContext.js';
import { CanvasDropZone } from './dnd/CanvasDropZone.js';

export type CanvasSurfaceProps = {
  styleTokens?: Record<string, string | number>;
  wrapEditNode?: (
    node: ViewNode,
    element: React.ReactNode,
    parent: ViewNode | null,
  ) => React.ReactNode;
  renderGridDropLayer?: (node: ViewNode) => React.ReactNode;
};

export function CanvasSurface({
  styleTokens,
  wrapEditNode,
  renderGridDropLayer,
}: CanvasSurfaceProps) {
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
    >
      {isEdit && <div className="vf-panel-header">Canvas</div>}
      <div
        ref={surfaceRef}
        className={`vf-canvas-surface${isEdit ? '' : ' vf-canvas-surface--live'}`}
        data-testid="vf-canvas-surface"
        onScroll={handleScroll}
      >
        {isEdit && (
          <>
            {isEmpty && (
              <div className="vf-canvas-empty">
                Drag components here or click an item in the palette
              </div>
            )}
            <CanvasDropZone />
          </>
        )}
        <ViewFoundryProvider
          document={document}
          registry={registry}
          selection={selection}
          mode={isEdit ? 'edit' : 'preview'}
          styleTokens={styleTokens}
          onSelectNode={isEdit ? (nodeId) => store.getState().selectNode(nodeId) : undefined}
          wrapEditNode={wrapEditNode}
          renderGridDropLayer={renderGridDropLayer}
        >
          <ViewRenderer />
        </ViewFoundryProvider>
      </div>
    </div>
  );
}
