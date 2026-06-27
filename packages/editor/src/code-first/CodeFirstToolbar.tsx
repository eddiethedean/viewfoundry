import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

export function CodeFirstToolbar() {
  const store = useCodeFirstStore();
  const studioMode = useCodeFirstState((s) => s.studioMode);
  const clickMode = useCodeFirstState((s) => s.clickMode);
  const viewport = useCodeFirstState((s) => s.viewport);
  const board = useCodeFirstState((s) => s.board);
  const canUndo = useCodeFirstState((s) => s.canUndo());
  const canRedo = useCodeFirstState((s) => s.canRedo());
  const lastError = useCodeFirstState((s) => s.lastError);
  const isEdit = studioMode === 'edit';

  return (
    <div className="vf-toolbar">
      <div className="vf-toolbar-group" role="group" aria-label="Board">
        <span className="vf-toolbar-label">Board</span>
        <select value={board.id} aria-label="Active board" disabled>
          <option value={board.id}>{board.name}</option>
        </select>
      </div>

      <div className="vf-toolbar-group vf-toolbar-mode" role="group" aria-label="Studio mode">
        <button
          type="button"
          className={isEdit ? 'vf-toolbar-mode-active' : ''}
          aria-pressed={isEdit}
          onClick={() => store.getState().setStudioMode('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={!isEdit ? 'vf-toolbar-mode-active' : ''}
          aria-pressed={!isEdit}
          onClick={() => store.getState().setStudioMode('live')}
        >
          Live
        </button>
      </div>

      {isEdit && (
        <>
          <div className="vf-toolbar-group" role="group" aria-label="Click mode">
            <button
              type="button"
              className={clickMode === 'parent-first' ? 'vf-toolbar-submode-active' : ''}
              aria-pressed={clickMode === 'parent-first'}
              onClick={() => store.getState().setClickMode('parent-first')}
            >
              Parent first
            </button>
            <button
              type="button"
              className={clickMode === 'child-first' ? 'vf-toolbar-submode-active' : ''}
              aria-pressed={clickMode === 'child-first'}
              onClick={() => store.getState().setClickMode('child-first')}
            >
              Child first
            </button>
          </div>
          <div className="vf-toolbar-group vf-toolbar-viewport">
            <label>
              W
              <input
                type="number"
                min={200}
                max={1920}
                value={viewport.width}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  store
                    .getState()
                    .setViewport(Number.isNaN(w) ? viewport.width : w, viewport.height);
                }}
              />
            </label>
            <label>
              H
              <input
                type="number"
                min={200}
                max={1200}
                value={viewport.height}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  store
                    .getState()
                    .setViewport(viewport.width, Number.isNaN(h) ? viewport.height : h);
                }}
              />
            </label>
          </div>
          <div className="vf-toolbar-group">
            <button type="button" disabled={!canUndo} onClick={() => store.getState().undo()}>
              Undo
            </button>
            <button type="button" disabled={!canRedo} onClick={() => store.getState().redo()}>
              Redo
            </button>
            <button type="button" onClick={() => store.getState().deleteSelected()}>
              Delete
            </button>
          </div>
        </>
      )}

      {lastError && (
        <p className="vf-toolbar-error" role="alert">
          {lastError}
          <button type="button" onClick={() => store.getState().clearError()}>
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}
