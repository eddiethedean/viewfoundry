import { useEffect } from 'react';
import type { ComponentRegistry, ViewDocument } from '@viewfoundry/core';
import { EditorProvider } from './EditorContext.js';
import { Toolbar } from './Toolbar.js';
import { Palette } from './Palette.js';
import { Canvas } from './Canvas.js';
import { Inspector } from './Inspector.js';
import { LayersPanel } from './LayersPanel.js';
import { useEditorStore } from './EditorContext.js';

export type ViewFoundryEditorProps = {
  registry: ComponentRegistry;
  document?: ViewDocument;
  onChange?: (document: ViewDocument) => void;
  onExport?: () => void;
  className?: string;
};

function KeyboardShortcuts() {
  const store = useEditorStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape') {
        store.getState().clearSelection();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputTarget(e.target)) {
        e.preventDefault();
        store.getState().deleteSelected();
      }
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.getState().undo();
      }
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        store.getState().redo();
      }
      if (mod && e.key === 'd') {
        e.preventDefault();
        store.getState().duplicateSelected();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  return null;
}

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function EditorLayout({ onExport, className }: { onExport?: () => void; className?: string }) {
  return (
    <div className={`vf-editor${className ? ` ${className}` : ''}`}>
      <KeyboardShortcuts />
      <Toolbar onExport={onExport} />
      <div className="vf-editor-body">
        <aside className="vf-editor-sidebar vf-editor-sidebar-left">
          <Palette />
          <LayersPanel />
        </aside>
        <main className="vf-editor-main">
          <Canvas />
        </main>
        <aside className="vf-editor-sidebar vf-editor-sidebar-right">
          <Inspector />
        </aside>
      </div>
    </div>
  );
}

export function ViewFoundryEditor({
  registry,
  document,
  onChange,
  onExport,
  className,
}: ViewFoundryEditorProps) {
  return (
    <EditorProvider registry={registry} document={document} onChange={onChange}>
      <EditorLayout onExport={onExport} className={className} />
    </EditorProvider>
  );
}
