import { useEffect } from 'react';
import type { ComponentRegistry } from '@viewfoundry/core';
import type { BoardDefinition } from '@viewfoundry/board';
import { CodeFirstEditorProvider } from './CodeFirstContext.js';
import { CodeFirstToolbar } from './CodeFirstToolbar.js';
import { ElementsPanel } from './ElementsPanel.js';
import { CodeFirstPropertiesPanel } from './CodeFirstPropertiesPanel.js';
import { CodeFirstStage } from './CodeFirstStage.js';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

export type CodeFirstEditorShellProps = {
  registry: ComponentRegistry;
  board: BoardDefinition;
  sourceFiles: Record<string, string>;
  activeSourceFile: string;
  onSourceFilesChange?: (files: Record<string, string>) => void;
  className?: string;
};

function isKeyboardShortcutBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
}

function CodeFirstKeyboardShortcuts() {
  const store = useCodeFirstStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (store.getState().studioMode === 'live') return;
      if (store.getState().isDragging) return;
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'Escape') {
        store.getState().selectElement(null);
      }
      if (mod && e.key === 'z' && !e.shiftKey && !isKeyboardShortcutBlocked(e.target)) {
        if (store.getState().canUndo()) {
          e.preventDefault();
          store.getState().undo();
        }
      }
      if (
        mod &&
        ((e.key === 'z' && e.shiftKey) || e.key === 'y') &&
        !isKeyboardShortcutBlocked(e.target)
      ) {
        if (store.getState().canRedo()) {
          e.preventDefault();
          store.getState().redo();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);

  return null;
}

function CodeFirstLayout({ className }: { className?: string }) {
  const studioMode = useCodeFirstState((s) => s.studioMode);
  const isEdit = studioMode === 'edit';

  return (
    <div
      className={`vf-editor vf-editor--code-first${isEdit ? '' : ' vf-editor--live'}${className ? ` ${className}` : ''}`}
    >
      <CodeFirstKeyboardShortcuts />
      <CodeFirstToolbar />
      <div className="vf-editor-body">
        {isEdit && (
          <aside className="vf-editor-sidebar vf-editor-sidebar-left">
            <ElementsPanel />
          </aside>
        )}
        <main className="vf-editor-main">
          <CodeFirstStage />
        </main>
        {isEdit && (
          <aside className="vf-editor-sidebar vf-editor-sidebar-right">
            <CodeFirstPropertiesPanel />
          </aside>
        )}
      </div>
    </div>
  );
}

export function CodeFirstEditorShell({
  registry,
  board,
  sourceFiles,
  activeSourceFile,
  onSourceFilesChange,
  className,
}: CodeFirstEditorShellProps) {
  return (
    <CodeFirstEditorProvider
      registry={registry}
      board={board}
      sourceFiles={sourceFiles}
      activeSourceFile={activeSourceFile}
      onSourceFilesChange={onSourceFilesChange}
    >
      <CodeFirstLayout className={className} />
    </CodeFirstEditorProvider>
  );
}
