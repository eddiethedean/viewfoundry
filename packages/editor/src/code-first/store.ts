import { createStore, type StoreApi } from 'zustand/vanilla';
import type { ComponentRegistry, SourceElementId } from '@viewfoundry/core';
import {
  canRedoFile,
  canUndoFile,
  createFileHistory,
  pushFileHistory,
  redoFileHistory,
  undoFileHistory,
} from '@viewfoundry/core';
import type { BoardDefinition } from '@viewfoundry/board';
import {
  parseSourceFile,
  patchSetProp,
  patchDeleteElement,
  patchMoveElement,
  type ParsedSourceFile,
} from '@viewfoundry/sync';
import type { ClickSelectionMode } from '@viewfoundry/react';

export type CodeFirstStudioMode = 'edit' | 'live';

export type CodeFirstEditorState = {
  registry: ComponentRegistry;
  board: BoardDefinition;
  sourceFiles: Record<string, string>;
  activeSourceFile: string;
  parsed: ParsedSourceFile | null;
  fileHistory: ReturnType<typeof createFileHistory>;
  selectedElementId: SourceElementId | null;
  studioMode: CodeFirstStudioMode;
  clickMode: ClickSelectionMode;
  viewport: { width: number; height: number };
  lastError: string | null;
  isDragging: boolean;
};

export type CodeFirstEditorActions = {
  setStudioMode: (mode: CodeFirstStudioMode) => void;
  setClickMode: (mode: ClickSelectionMode) => void;
  setViewport: (width: number, height: number) => void;
  selectElement: (id: SourceElementId | null) => void;
  syncSourceFiles: (files: Record<string, string>, file?: string) => void;
  updateProp: (propName: string, value: unknown) => void;
  deleteSelected: () => void;
  moveElement: (elementId: SourceElementId, parentId: SourceElementId, index: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setDragging: (dragging: boolean) => void;
  clearError: () => void;
};

export type CodeFirstEditorStore = CodeFirstEditorState & CodeFirstEditorActions;

function reparse(state: CodeFirstEditorState): ParsedSourceFile | null {
  const content = state.sourceFiles[state.activeSourceFile];
  if (!content) return null;
  return parseSourceFile(state.activeSourceFile, content);
}

function applyFilePatch(
  state: CodeFirstEditorState,
  file: string,
  content: string,
): Partial<CodeFirstEditorState> {
  const sourceFiles = { ...state.sourceFiles, [file]: content };
  const fileHistory = pushFileHistory(state.fileHistory, sourceFiles);
  const next = { ...state, sourceFiles, fileHistory, activeSourceFile: file, lastError: null };
  return { ...next, parsed: reparse(next) };
}

export function createCodeFirstStore(options: {
  registry: ComponentRegistry;
  board: BoardDefinition;
  sourceFiles: Record<string, string>;
  activeSourceFile: string;
  onSourceFilesChange?: (files: Record<string, string>) => void;
}): StoreApi<CodeFirstEditorStore> {
  const initialFiles = { ...options.sourceFiles };
  const initialState: CodeFirstEditorState = {
    registry: options.registry,
    board: options.board,
    sourceFiles: initialFiles,
    activeSourceFile: options.activeSourceFile,
    parsed: parseSourceFile(options.activeSourceFile, initialFiles[options.activeSourceFile] ?? ''),
    fileHistory: createFileHistory(initialFiles),
    selectedElementId: null,
    studioMode: 'edit',
    clickMode: 'parent-first',
    viewport: { ...options.board.viewport },
    lastError: null,
    isDragging: false,
  };

  return createStore<CodeFirstEditorStore>((set, get) => ({
    ...initialState,

    setStudioMode: (mode) => set({ studioMode: mode }),
    setClickMode: (mode) => set({ clickMode: mode }),
    setViewport: (width, height) => set({ viewport: { width, height } }),
    selectElement: (id) => set({ selectedElementId: id, lastError: null }),
    clearError: () => set({ lastError: null }),
    setDragging: (isDragging) => set({ isDragging }),

    syncSourceFiles: (files, file) => {
      const active = file ?? get().activeSourceFile;
      const next = {
        ...get(),
        sourceFiles: { ...files },
        activeSourceFile: active,
      };
      set({ ...next, parsed: reparse(next) });
    },

    updateProp: (propName, value) => {
      const state = get();
      const id = state.selectedElementId;
      if (!id) return;
      const content = state.sourceFiles[state.activeSourceFile] ?? '';
      const result = patchSetProp(content, {
        file: state.activeSourceFile,
        elementId: id,
        propName,
        value,
      });
      if (!result.ok) {
        set({ lastError: result.error });
        return;
      }
      const patch = result.patches[0];
      set(applyFilePatch(state, patch.file, patch.content));
      options.onSourceFilesChange?.(get().sourceFiles);
    },

    deleteSelected: () => {
      const state = get();
      const id = state.selectedElementId;
      if (!id) return;
      const content = state.sourceFiles[state.activeSourceFile] ?? '';
      const result = patchDeleteElement(content, {
        file: state.activeSourceFile,
        elementId: id,
      });
      if (!result.ok) {
        set({ lastError: result.error });
        return;
      }
      const patch = result.patches[0];
      set({ ...applyFilePatch(state, patch.file, patch.content), selectedElementId: null });
      options.onSourceFilesChange?.(get().sourceFiles);
    },

    moveElement: (elementId, parentId, index) => {
      const state = get();
      const content = state.sourceFiles[state.activeSourceFile] ?? '';
      const result = patchMoveElement(content, {
        file: state.activeSourceFile,
        elementId,
        parentElementId: parentId,
        index,
      });
      if (!result.ok) {
        set({ lastError: result.error });
        return;
      }
      const patch = result.patches[0];
      set(applyFilePatch(state, patch.file, patch.content));
      options.onSourceFilesChange?.(get().sourceFiles);
    },

    undo: () => {
      const state = get();
      if (!canUndoFile(state.fileHistory)) return;
      const fileHistory = undoFileHistory(state.fileHistory);
      const next = { ...state, fileHistory, sourceFiles: { ...fileHistory.present } };
      set({ ...next, parsed: reparse(next) });
      options.onSourceFilesChange?.(get().sourceFiles);
    },

    redo: () => {
      const state = get();
      if (!canRedoFile(state.fileHistory)) return;
      const fileHistory = redoFileHistory(state.fileHistory);
      const next = { ...state, fileHistory, sourceFiles: { ...fileHistory.present } };
      set({ ...next, parsed: reparse(next) });
      options.onSourceFilesChange?.(get().sourceFiles);
    },

    canUndo: () => canUndoFile(get().fileHistory),
    canRedo: () => canRedoFile(get().fileHistory),
  }));
}

export type CodeFirstStoreApi = StoreApi<CodeFirstEditorStore>;
