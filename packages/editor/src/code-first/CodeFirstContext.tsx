import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { CodeFirstEditorStore, CodeFirstStoreApi } from './store.js';
import { createCodeFirstStore } from './store.js';
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
  const storeRef = useRef<CodeFirstStoreApi | null>(null);
  if (!storeRef.current) {
    storeRef.current = createCodeFirstStore({
      registry,
      board,
      sourceFiles,
      activeSourceFile,
      onSourceFilesChange,
    });
  }

  return (
    <CodeFirstEditorContext.Provider value={storeRef.current}>
      {children}
    </CodeFirstEditorContext.Provider>
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
