import { createContext, useContext, type ReactNode } from 'react';
import type { ComponentRegistry, SourceElementId } from '@viewfoundry/core';
import type { BoardDefinition } from '@viewfoundry/board';

export type ClickSelectionMode = 'parent-first' | 'child-first';

export type CodeFirstContextValue = {
  registry: ComponentRegistry;
  board: BoardDefinition;
  mode: 'preview' | 'edit';
  selectedElementId: SourceElementId | null;
  clickMode: ClickSelectionMode;
  viewport: { width: number; height: number };
  onSelectElement: (id: SourceElementId | null) => void;
};

const CodeFirstContext = createContext<CodeFirstContextValue | null>(null);

export type CodeFirstProviderProps = {
  registry: ComponentRegistry;
  board: BoardDefinition;
  mode?: 'preview' | 'edit';
  selectedElementId?: SourceElementId | null;
  clickMode?: ClickSelectionMode;
  viewport?: { width: number; height: number };
  onSelectElement?: (id: SourceElementId | null) => void;
  children: ReactNode;
};

export function CodeFirstProvider({
  registry,
  board,
  mode = 'preview',
  selectedElementId = null,
  clickMode = 'parent-first',
  viewport,
  onSelectElement,
  children,
}: CodeFirstProviderProps) {
  const vp = viewport ?? board.viewport;
  return (
    <CodeFirstContext.Provider
      value={{
        registry,
        board,
        mode,
        selectedElementId,
        clickMode,
        viewport: vp,
        onSelectElement: onSelectElement ?? (() => {}),
      }}
    >
      {children}
    </CodeFirstContext.Provider>
  );
}

export function useCodeFirstContext(): CodeFirstContextValue {
  const ctx = useContext(CodeFirstContext);
  if (!ctx) throw new Error('useCodeFirstContext must be used within CodeFirstProvider');
  return ctx;
}

export function parseSourceLoc(value: string | undefined): { file: string; start: number; end: number } | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length < 3) return null;
  const end = Number(parts.pop());
  const start = Number(parts.pop());
  const file = parts.join(':');
  if (!file || Number.isNaN(start) || Number.isNaN(end)) return null;
  return { file, start, end };
}

export function formatSourceLoc(file: string, start: number, end: number): string {
  return `${file}:${start}:${end}`;
}
