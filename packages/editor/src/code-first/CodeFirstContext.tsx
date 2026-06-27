import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { CodeFirstEditorStore, CodeFirstStoreApi } from './store.js';
import { createCodeFirstStore, filesSnapshot } from './store.js';
import type { ComponentRegistry } from '@viewfoundry/core';
import type { BoardDefinition } from '@viewfoundry/board';

const CodeFirstEditorContext = createContext<CodeFirstStoreApi | null>(null);

export type CodeFirstEditorProviderProps = {
  registry: ComponentRegistry;
  board: BoardDefinition;
  sourceFiles: Record<string, string>;
  activeSourceFile: string;
  onSourceFilesChange?: (files: Record<string, string>) => void;
  children: ReactNode;
};

export function CodeFirstEditorProvider({
  registry,
  board,
  sourceFiles,
  activeSourceFile,
  onSourceFilesChange,
  children,
}: CodeFirstEditorProviderProps) {
  const onSourceFilesChangeRef = useRef(onSourceFilesChange);
  onSourceFilesChangeRef.current = onSourceFilesChange;

  const lastEmittedRef = useRef<string | null>(null);

  const storeRef = useRef<CodeFirstStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createCodeFirstStore({
      registry,
      board,
      sourceFiles,
      activeSourceFile,
      getOnSourceFilesChange: () => {
        const cb = onSourceFilesChangeRef.current;
        return cb
          ? (files) => {
              lastEmittedRef.current = filesSnapshot(files);
              cb(files);
            }
          : undefined;
      },
    });
    lastEmittedRef.current = filesSnapshot(sourceFiles);
  }

  const store = storeRef.current;

  useEffect(() => {
    store.getState().syncRegistry(registry);
  }, [registry, store]);

  useEffect(() => {
    store.getState().syncBoard(board);
  }, [board, store]);

  useEffect(() => {
    const snapshot = filesSnapshot(sourceFiles);
    const state = store.getState();
    const localSnapshot = filesSnapshot(state.sourceFiles);
    if (snapshot === localSnapshot && activeSourceFile === state.activeSourceFile) return;

    const isExternal = snapshot !== lastEmittedRef.current;
    store.getState().syncSourceFiles(sourceFiles, activeSourceFile, isExternal);
  }, [sourceFiles, activeSourceFile, store]);

  return (
    <CodeFirstEditorContext.Provider value={store}>{children}</CodeFirstEditorContext.Provider>
  );
}

export function useCodeFirstStore(): CodeFirstStoreApi {
  const store = useContext(CodeFirstEditorContext);
  if (!store) throw new Error('useCodeFirstStore must be used within CodeFirstEditorProvider');
  return store;
}

export function useCodeFirstState<T>(selector: (s: CodeFirstEditorStore) => T): T {
  const store = useCodeFirstStore();
  return useStore(store, selector);
}
