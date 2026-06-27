import { useMemo, type MouseEvent, type ReactNode } from 'react';
import { AstStageRenderer, CodeFirstProvider } from '@viewfoundry/react';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';
import { CodeFirstStageDnd, DraggableElement, DropSlot } from './CodeFirstStageDnd.js';

export function CodeFirstStage() {
  const store = useCodeFirstStore();
  const registry = useCodeFirstState((s) => s.registry);
  const board = useCodeFirstState((s) => s.board);
  const studioMode = useCodeFirstState((s) => s.studioMode);
  const selectedElementId = useCodeFirstState((s) => s.selectedElementId);
  const clickMode = useCodeFirstState((s) => s.clickMode);
  const viewport = useCodeFirstState((s) => s.viewport);
  const parsed = useCodeFirstState((s) => s.parsed);

  const mode = studioMode === 'edit' ? 'edit' : 'preview';

  const dndRender = useMemo(
    () =>
      mode === 'edit'
        ? {
            wrapElement: ({
              elementId,
              tagName,
              children,
            }: {
              elementId: string;
              tagName: string;
              children: ReactNode;
            }) => (
              <DraggableElement elementId={elementId} tagName={tagName}>
                {children}
              </DraggableElement>
            ),
            renderDropSlot: ({ parentId, index }: { parentId: string; index: number }) => (
              <DropSlot parentId={parentId} index={index} />
            ),
          }
        : undefined,
    [mode],
  );

  const handleStageClick = (e: MouseEvent) => {
    if (mode !== 'edit') return;
    const target = e.target as HTMLElement;
    const el = target.closest('[data-vf-element-id]') as HTMLElement | null;
    if (!el) {
      store.getState().selectElement(null);
      return;
    }
    const id = el.dataset.vfElementId ?? null;
    if (!id || !parsed) return;

    if (clickMode === 'child-first') {
      store.getState().selectElement(id);
      return;
    }

    const clicked = parsed.elements.get(id);
    if (!clicked) return;
    if (selectedElementId === id && clicked.parentId) {
      store.getState().selectElement(clicked.parentId);
    } else {
      store.getState().selectElement(id);
    }
  };

  return (
    <div
      className="vf-canvas vf-stage"
      data-testid="vf-code-first-stage"
      onClick={handleStageClick}
    >
      <CodeFirstProvider
        registry={registry}
        board={board}
        mode={mode}
        selectedElementId={selectedElementId}
        clickMode={clickMode}
        viewport={viewport}
        onSelectElement={(id) => store.getState().selectElement(id)}
      >
        <CodeFirstStageDnd>
          {parsed ? (
            <AstStageRenderer
              parsed={parsed}
              registry={registry}
              mode={mode}
              viewport={viewport}
              background={board.background}
              dnd={dndRender}
            />
          ) : (
            <p className="vf-stage-empty">No source loaded</p>
          )}
        </CodeFirstStageDnd>
      </CodeFirstProvider>
    </div>
  );
}
