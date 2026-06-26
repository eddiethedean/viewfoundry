import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { ComponentRegistry, ViewDocument } from '@viewfoundry/core';
import { createEditorStore, type EditorStoreApi, type StudioMode } from './store.js';
import { isStaleInboundDocument } from './sync-utils.js';

const EditorStoreContext = createContext<EditorStoreApi | null>(null);

export type EditorProviderProps = {
  registry: ComponentRegistry;
  document?: ViewDocument;
  onChange?: (document: ViewDocument) => void;
  defaultStudioMode?: StudioMode;
  onStudioModeChange?: (mode: StudioMode) => void;
  children: ReactNode;
};

export function EditorProvider({
  registry,
  document,
  onChange,
  defaultStudioMode,
  onStudioModeChange,
  children,
}: EditorProviderProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onStudioModeChangeRef = useRef(onStudioModeChange);
  onStudioModeChangeRef.current = onStudioModeChange;

  const lastEmittedDocumentRef = useRef<string | null>(null);

  const store = useMemo(
    () =>
      createEditorStore(
        registry,
        document,
        (doc) => {
          lastEmittedDocumentRef.current = JSON.stringify(doc.root);
          onChangeRef.current?.(doc);
        },
        {
          defaultStudioMode,
          onStudioModeChange: (mode) => onStudioModeChangeRef.current?.(mode),
        },
      ),
    [],
  );

  useEffect(() => {
    store.getState().setRegistry(registry);
  }, [registry, store]);

  useEffect(() => {
    if (!document) return;
    const state = store.getState();
    const rootMatchesEmitted = JSON.stringify(document.root) === lastEmittedDocumentRef.current;
    const metaOrVersionChanged =
      document.version !== state.document.version ||
      JSON.stringify(document.meta ?? null) !== JSON.stringify(state.document.meta ?? null);

    if (rootMatchesEmitted && !metaOrVersionChanged) return;
    if (!rootMatchesEmitted && isStaleInboundDocument(document, state.document, state.history)) {
      return;
    }
    store.getState().syncDocument(document);
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

export function useEditorState<T>(
  selector: (state: ReturnType<EditorStoreApi['getState']>) => T,
): T {
  const store = useEditorStore();
  return store(selector);
}
