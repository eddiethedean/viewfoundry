import { createContext, useContext, type ReactNode } from 'react';
import type { ComponentRegistry, SelectionState, ViewDocument, ViewNode } from '@viewfoundry/core';
import { createSelection } from '@viewfoundry/core';

export type ViewFoundryContextValue = {
  document: ViewDocument;
  registry: ComponentRegistry;
  selection: SelectionState;
  mode: 'preview' | 'edit';
  onSelectNode?: (nodeId: string | null) => void;
  wrapEditNode?: (node: ViewNode, element: ReactNode, parent: ViewNode | null) => ReactNode;
  renderGridDropLayer?: (node: ViewNode) => ReactNode;
};

const ViewFoundryContext = createContext<ViewFoundryContextValue | null>(null);

export type ViewFoundryProviderProps = {
  document: ViewDocument;
  registry: ComponentRegistry;
  selection?: SelectionState;
  mode?: 'preview' | 'edit';
  onSelectNode?: (nodeId: string | null) => void;
  wrapEditNode?: (node: ViewNode, element: ReactNode, parent: ViewNode | null) => ReactNode;
  renderGridDropLayer?: (node: ViewNode) => ReactNode;
  children: ReactNode;
};

export function ViewFoundryProvider({
  document,
  registry,
  selection = createSelection(),
  mode = 'preview',
  onSelectNode,
  wrapEditNode,
  renderGridDropLayer,
  children,
}: ViewFoundryProviderProps) {
  return (
    <ViewFoundryContext.Provider
      value={{
        document,
        registry,
        selection,
        mode,
        onSelectNode,
        wrapEditNode,
        renderGridDropLayer,
      }}
    >
      {children}
    </ViewFoundryContext.Provider>
  );
}

export function useViewFoundryContext(): ViewFoundryContextValue {
  const ctx = useContext(ViewFoundryContext);
  if (!ctx) {
    throw new Error('useViewFoundryContext must be used within ViewFoundryProvider');
  }
  return ctx;
}

export function useViewDocument(): ViewDocument {
  return useViewFoundryContext().document;
}

export function useViewRegistry(): ComponentRegistry {
  return useViewFoundryContext().registry;
}

export function useViewSelection(): SelectionState {
  return useViewFoundryContext().selection;
}
