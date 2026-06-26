import { useEffect } from 'react';
import type { ComponentRegistry, ViewDocument } from '@viewfoundry/core';
import { EditorProvider } from './EditorContext.js';
import type { StudioMode } from './store.js';
import { Toolbar } from './Toolbar.js';
import { Palette } from './Palette.js';
import { Canvas } from './Canvas.js';
import { Inspector } from './Inspector.js';
import { StyleInspector } from './StyleInspector.js';
import { LayersPanel } from './LayersPanel.js';
import { EditorDndShell } from './EditorDndShell.js';
import { useEditorStore, useEditorState } from './EditorContext.js';
import { findNodeLocation, isGridContainer } from '@viewfoundry/core';

export type ViewFoundryEditorProps = {
  registry: ComponentRegistry;
  document?: ViewDocument;
  onChange?: (document: ViewDocument) => void;
  onExport?: () => void;
  className?: string;
  defaultStudioMode?: StudioMode;
  onStudioModeChange?: (mode: StudioMode) => void;
  styleTokens?: Record<string, string | number>;
};

function KeyboardShortcuts() {
  const store = useEditorStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (store.getState().studioMode === 'live') return;

      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape') {
        store.getState().clearSelection();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isKeyboardShortcutBlocked(e.target)) {
        e.preventDefault();
        store.getState().deleteSelected();
      }
      if (mod && e.key === 'z' && !e.shiftKey && !isKeyboardShortcutBlocked(e.target)) {
        e.preventDefault();
        store.getState().undo();
      }
      if (
        mod &&
        ((e.key === 'z' && e.shiftKey) || e.key === 'y') &&
        !isKeyboardShortcutBlocked(e.target)
      ) {
        e.preventDefault();
        store.getState().redo();
      }
      if (mod && e.key === 'd') {
        e.preventDefault();
        store.getState().duplicateSelected();
      }
      if (!isKeyboardShortcutBlocked(e.target) && !mod) {
        const nodeId = store.getState().selection.selectedNodeIds[0];
        if (!nodeId) return;
        const { document } = store.getState();
        const location = findNodeLocation(document.root, nodeId);
        if (!location?.parent || !isGridContainer(location.parent.type)) return;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          store.getState().nudgeNodeLayout(nodeId, { column: -1 });
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          store.getState().nudgeNodeLayout(nodeId, { column: 1 });
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          store.getState().nudgeNodeLayout(nodeId, { row: -1 });
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          store.getState().nudgeNodeLayout(nodeId, { row: 1 });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  return null;
}

function isKeyboardShortcutBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest('.vf-toolbar'));
}

function EditorLayout({
  onExport,
  className,
  styleTokens,
}: {
  onExport?: () => void;
  className?: string;
  styleTokens?: Record<string, string | number>;
}) {
  const studioMode = useEditorState((s) => s.studioMode);
  const editSubMode = useEditorState((s) => s.editSubMode);
  const isEdit = studioMode === 'edit';
  const isStyleMode = isEdit && editSubMode === 'style';

  return (
    <div
      className={`vf-editor${isEdit ? '' : ' vf-editor--live'}${isStyleMode ? ' vf-editor--style' : ''}${className ? ` ${className}` : ''}`}
    >
      <KeyboardShortcuts />
      <Toolbar onExport={onExport} />
      <EditorDndShell>
        <div className="vf-editor-body">
          {isEdit && (
            <aside className="vf-editor-sidebar vf-editor-sidebar-left">
              {!isStyleMode && <Palette />}
              <LayersPanel />
            </aside>
          )}
          <main className="vf-editor-main">
            <Canvas styleTokens={styleTokens} />
          </main>
          {isEdit && (
            <aside className="vf-editor-sidebar vf-editor-sidebar-right">
              {isStyleMode ? <StyleInspector styleTokens={styleTokens} /> : <Inspector />}
            </aside>
          )}
        </div>
      </EditorDndShell>
    </div>
  );
}

export function ViewFoundryEditor({
  registry,
  document,
  onChange,
  onExport,
  className,
  defaultStudioMode,
  onStudioModeChange,
  styleTokens,
}: ViewFoundryEditorProps) {
  return (
    <EditorProvider
      registry={registry}
      document={document}
      onChange={onChange}
      defaultStudioMode={defaultStudioMode}
      onStudioModeChange={onStudioModeChange}
    >
      <EditorLayout onExport={onExport} className={className} styleTokens={styleTokens} />
    </EditorProvider>
  );
}
