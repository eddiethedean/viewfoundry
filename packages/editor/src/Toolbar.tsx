import { useEditorState, useEditorStore } from './EditorContext.js';

export type ToolbarProps = {
  onExport?: () => void;
};

export function Toolbar({ onExport }: ToolbarProps) {
  const store = useEditorStore();
  const studioMode = useEditorState((s) => s.studioMode);
  const editSubMode = useEditorState((s) => s.editSubMode);
  const canUndo = useEditorState((s) => s.canUndo());
  const canRedo = useEditorState((s) => s.canRedo());
  const lastError = useEditorState((s) => s.lastError);
  const isEdit = studioMode === 'edit';

  return (
    <div className="vf-toolbar">
      <div className="vf-toolbar-group vf-toolbar-mode" role="group" aria-label="Studio mode">
        <button
          type="button"
          className={studioMode === 'edit' ? 'vf-toolbar-mode-active' : ''}
          aria-pressed={studioMode === 'edit'}
          onClick={() => store.getState().setStudioMode('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={studioMode === 'live' ? 'vf-toolbar-mode-active' : ''}
          aria-pressed={studioMode === 'live'}
          onClick={() => store.getState().setStudioMode('live')}
        >
          Live
        </button>
      </div>

      {isEdit && (
        <div
          className="vf-toolbar-group vf-toolbar-submode"
          role="group"
          aria-label="Edit sub-mode"
        >
          <button
            type="button"
            className={editSubMode === 'component' ? 'vf-toolbar-submode-active' : ''}
            aria-pressed={editSubMode === 'component'}
            onClick={() => store.getState().setEditSubMode('component')}
          >
            Component
          </button>
          <button
            type="button"
            className={editSubMode === 'style' ? 'vf-toolbar-submode-active' : ''}
            aria-pressed={editSubMode === 'style'}
            onClick={() => store.getState().setEditSubMode('style')}
          >
            Style
          </button>
        </div>
      )}

      {isEdit && (
        <>
          <div className="vf-toolbar-group">
            <button type="button" disabled={!canUndo} onClick={() => store.getState().undo()}>
              Undo
            </button>
            <button type="button" disabled={!canRedo} onClick={() => store.getState().redo()}>
              Redo
            </button>
          </div>
          <div className="vf-toolbar-group">
            <button type="button" onClick={() => store.getState().deleteSelected()}>
              Delete
            </button>
            <button type="button" onClick={() => store.getState().duplicateSelected()}>
              Duplicate
            </button>
          </div>
        </>
      )}

      {isEdit && onExport && (
        <div className="vf-toolbar-group vf-toolbar-right">
          <button type="button" onClick={onExport}>
            Export TSX
          </button>
        </div>
      )}

      {isEdit && lastError && (
        <div className="vf-toolbar-error" role="alert">
          {lastError}
        </div>
      )}
    </div>
  );
}
