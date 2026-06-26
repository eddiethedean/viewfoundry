import { useEditorState, useEditorStore } from './EditorContext.js';

export type ToolbarProps = {
  onExport?: () => void;
};

export function Toolbar({ onExport }: ToolbarProps) {
  const store = useEditorStore();
  const canUndo = useEditorState((s) => s.canUndo());
  const canRedo = useEditorState((s) => s.canRedo());

  return (
    <div className="vf-toolbar">
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
      {onExport && (
        <div className="vf-toolbar-group vf-toolbar-right">
          <button type="button" onClick={onExport}>
            Export TSX
          </button>
        </div>
      )}
    </div>
  );
}
