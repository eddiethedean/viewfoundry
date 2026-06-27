import { useEditorState, useEditorStore } from './EditorContext.js';
import { toggleTheme, type EditorTheme } from './theme.js';

export type ToolbarProps = {
  onExport?: () => void;
  theme?: EditorTheme;
  onThemeChange?: (theme: EditorTheme) => void;
};

export function Toolbar({ onExport, theme = 'dark', onThemeChange }: ToolbarProps) {
  const store = useEditorStore();
  const studioMode = useEditorState((s) => s.studioMode);
  const editSubMode = useEditorState((s) => s.editSubMode);
  const canUndo = useEditorState((s) => s.canUndo());
  const canRedo = useEditorState((s) => s.canRedo());
  const showGrid = useEditorState((s) => s.showGrid);
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
          <button
            type="button"
            className={showGrid ? 'vf-toolbar-submode-active' : ''}
            aria-pressed={showGrid}
            aria-label="Show Grid"
            onClick={() => store.getState().toggleShowGrid()}
          >
            Show Grid
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
            <button type="button" onClick={() => store.getState().duplicateSelected()}>
              Duplicate
            </button>
          </div>
        </>
      )}

      {isEdit && onExport && (
        <div className="vf-toolbar-group">
          <button type="button" onClick={onExport}>
            Export TSX
          </button>
        </div>
      )}

      {onThemeChange && (
        <div className="vf-toolbar-group">
          <button
            type="button"
            className="vf-toolbar-theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'light'}
            onClick={() => onThemeChange(toggleTheme(theme))}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      )}

      <div className="vf-toolbar-spacer" aria-hidden="true" />

      {isEdit && lastError && (
        <div className="vf-toolbar-error" role="alert">
          {lastError}
        </div>
      )}
    </div>
  );
}
