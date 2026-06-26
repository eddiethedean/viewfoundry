import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { ComponentRegistry, ViewDocument } from '@viewfoundry/core';
import { createEditorStore, type EditorStoreApi } from './store.js';

const EditorStoreContext = createContext<EditorStoreApi | null>(null);

export type EditorProviderProps = {
  registry: ComponentRegistry;
  document?: ViewDocument;
  onChange?: (document: ViewDocument) => void;
  children: ReactNode;
};

export function EditorProvider({ registry, document, onChange, children }: EditorProviderProps) {
  const store = useMemo(
    () => createEditorStore(registry, document, onChange),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    store.getState().setRegistry(registry);
  }, [registry, store]);

  useEffect(() => {
    if (document) {
      store.getState().setDocument(document);
    }
  }, [document, store]);

  return <EditorStoreContext.Provider value={store}>{children}</EditorStoreContext.Provider>;
}

export function useEditorStore(): EditorStoreApi {
  const store = useContext(EditorStoreContext);
  if (!store) {
    throw new Error('useEditorStore must be used within EditorProvider');
  }
  return store;
}

export function useEditorState<T>(selector: (state: ReturnType<EditorStoreApi['getState']>) => T): T {
  const store = useEditorStore();
  return store(selector);
}
