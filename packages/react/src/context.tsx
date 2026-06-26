import { createContext, useContext, type ReactNode } from 'react';
import type {
  ComponentRegistry,
  SelectionState,
  ViewDocument,
} from '@viewfoundry/core';
import { createSelection } from '@viewfoundry/core';

export type ViewFoundryContextValue = {
  document: ViewDocument;
  registry: ComponentRegistry;
  selection: SelectionState;
  mode: 'preview' | 'edit';
  onSelectNode?: (nodeId: string | null) => void;
};

const ViewFoundryContext = createContext<ViewFoundryContextValue | null>(null);

export type ViewFoundryProviderProps = {
  document: ViewDocument;
  registry: ComponentRegistry;
  selection?: SelectionState;
  mode?: 'preview' | 'edit';
  onSelectNode?: (nodeId: string | null) => void;
  children: ReactNode;
};

export function ViewFoundryProvider({
  document,
  registry,
  selection = createSelection(),
  mode = 'preview',
  onSelectNode,
  children,
}: ViewFoundryProviderProps) {
  return (
    <ViewFoundryContext.Provider
      value={{ document, registry, selection, mode, onSelectNode }}
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
