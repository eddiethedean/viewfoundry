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
  isAncestor,
  getElementIdentity,
  reconcileElementId,
  type ParsedSourceFile,
  type ElementIdentity,
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
  syncSourceFiles: (files: Record<string, string>, file?: string, external?: boolean) => void;
  syncRegistry: (registry: ComponentRegistry) => void;
  syncBoard: (board: BoardDefinition) => void;
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

const DEFAULT_VIEWPORT = { width: 360, height: 200 };
const MIN_VIEWPORT = 200;
const MAX_VIEWPORT = { width: 1920, height: 1200 };

function reparse(state: CodeFirstEditorState): ParsedSourceFile | null {
  const content = state.sourceFiles[state.activeSourceFile];
  if (!content) return null;
  return parseSourceFile(state.activeSourceFile, content);
}

function filesSnapshot(files: Record<string, string>): string {
  return JSON.stringify(files);
}

function reconcileSelection(
  parsed: ParsedSourceFile | null,
  priorId: SourceElementId | null,
  priorIdentity: ElementIdentity | null,
): SourceElementId | null {
  if (!parsed || !priorId) return null;
  return reconcileElementId(parsed, priorId, priorIdentity);
}

function applyFilePatch(
  state: CodeFirstEditorState,
  file: string,
  content: string,
  priorSelection: { id: SourceElementId | null; identity: ElementIdentity | null },
): Partial<CodeFirstEditorState> {
  const sourceFiles = { ...state.sourceFiles, [file]: content };
  const fileHistory = pushFileHistory(state.fileHistory, sourceFiles);
  const next = { ...state, sourceFiles, fileHistory, activeSourceFile: file, lastError: null };
  const parsed = reparse(next);
  const selectedElementId = reconcileSelection(parsed, priorSelection.id, priorSelection.identity);
  return { ...next, parsed, selectedElementId };
}

function captureSelection(state: CodeFirstEditorState): {
  id: SourceElementId | null;
  identity: ElementIdentity | null;
} {
  const id = state.selectedElementId;
  if (!id || !state.parsed) return { id, identity: null };
  return { id, identity: getElementIdentity(state.parsed, id) };
}

function clampViewport(width: number, height: number): { width: number; height: number } {
  const w = Number.isFinite(width) && width > 0 ? width : DEFAULT_VIEWPORT.width;
  const h = Number.isFinite(height) && height > 0 ? height : DEFAULT_VIEWPORT.height;
  return {
    width: Math.min(MAX_VIEWPORT.width, Math.max(MIN_VIEWPORT, w)),
    height: Math.min(MAX_VIEWPORT.height, Math.max(MIN_VIEWPORT, h)),
  };
}

export function createCodeFirstStore(options: {
  registry: ComponentRegistry;
  board: BoardDefinition;
  sourceFiles: Record<string, string>;
  activeSourceFile: string;
  getOnSourceFilesChange?: () => ((files: Record<string, string>) => void) | undefined;
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
    viewport: clampViewport(options.board.viewport.width, options.board.viewport.height),
    lastError: null,
    isDragging: false,
  };

  const emitChange = (files: Record<string, string>) => {
    options.getOnSourceFilesChange?.()?.(files);
  };

  return createStore<CodeFirstEditorStore>((set, get) => ({
    ...initialState,

    setStudioMode: (mode) => set({ studioMode: mode }),
    setClickMode: (mode) => set({ clickMode: mode }),
    setViewport: (width, height) => set({ viewport: clampViewport(width, height) }),
    selectElement: (id) => set({ selectedElementId: id, lastError: null }),
    clearError: () => set({ lastError: null }),
    setDragging: (isDragging) => set({ isDragging }),

    syncRegistry: (registry) => set({ registry }),
    syncBoard: (board) =>
      set({
        board,
        viewport: clampViewport(board.viewport.width, board.viewport.height),
      }),

    syncSourceFiles: (files, file, external = false) => {
      const active = file ?? get().activeSourceFile;
      const nextFiles = { ...files };
      const fileHistory = external ? createFileHistory(nextFiles) : get().fileHistory;
      const next = {
        ...get(),
        sourceFiles: nextFiles,
        activeSourceFile: active,
        fileHistory,
        selectedElementId: external ? null : get().selectedElementId,
      };
      set({ ...next, parsed: reparse(next) });
    },

    updateProp: (propName, value) => {
      if (typeof value === 'number' && Number.isNaN(value)) return;
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
      const prior = captureSelection(state);
      set(applyFilePatch(state, patch.file, patch.content, prior));
      emitChange(get().sourceFiles);
    },

    deleteSelected: () => {
      const state = get();
      const id = state.selectedElementId;
      if (!id || !state.parsed) return;

      if (state.parsed.rootIds.includes(id)) {
        set({ lastError: 'Cannot delete a root element' });
        return;
      }

      const content = state.sourceFiles[state.activeSourceFile] ?? '';
      const result = patchDeleteElement(content, {
        file: state.activeSourceFile,
        elementId: id,
      });
      if (!result.ok) {
        set({ lastError: result.error });
        return;
      }

      const reparsed = parseSourceFile(state.activeSourceFile, result.patches[0].content);
      if (reparsed.rootIds.length === 0) {
        set({ lastError: 'Cannot delete the last element in the return' });
        return;
      }

      const patch = result.patches[0];
      set({
        ...applyFilePatch(state, patch.file, patch.content, { id: null, identity: null }),
      });
      emitChange(get().sourceFiles);
    },

    moveElement: (elementId, parentId, index) => {
      const state = get();
      if (!state.parsed) return;

      if (isAncestor(state.parsed, elementId, parentId)) {
        set({ lastError: 'Cannot move an element inside itself or its descendants' });
        return;
      }

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
      const prior = captureSelection(state);
      set(applyFilePatch(state, patch.file, patch.content, prior));
      emitChange(get().sourceFiles);
    },

    undo: () => {
      const state = get();
      if (!canUndoFile(state.fileHistory)) return;
      const prior = captureSelection(state);
      const fileHistory = undoFileHistory(state.fileHistory);
      const next = {
        ...state,
        fileHistory,
        sourceFiles: { ...fileHistory.present },
        lastError: null,
      };
      const parsed = reparse(next);
      set({
        ...next,
        parsed,
        selectedElementId: reconcileSelection(parsed, prior.id, prior.identity),
      });
      emitChange(get().sourceFiles);
    },

    redo: () => {
      const state = get();
      if (!canRedoFile(state.fileHistory)) return;
      const prior = captureSelection(state);
      const fileHistory = redoFileHistory(state.fileHistory);
      const next = {
        ...state,
        fileHistory,
        sourceFiles: { ...fileHistory.present },
        lastError: null,
      };
      const parsed = reparse(next);
      set({
        ...next,
        parsed,
        selectedElementId: reconcileSelection(parsed, prior.id, prior.identity),
      });
      emitChange(get().sourceFiles);
    },

    canUndo: () => canUndoFile(get().fileHistory),
    canRedo: () => canRedoFile(get().fileHistory),
  }));
}

export type CodeFirstStoreApi = StoreApi<CodeFirstEditorStore>;

export { filesSnapshot };
