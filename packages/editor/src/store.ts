import { create } from 'zustand';
import {
  applyCommand,
  canRedo,
  canUndo,
  clearSelection,
  createDocument,
  createHistory,
  createNode,
  createSelection,
  findNode,
  getPrimarySelection,
  pushHistory,
  redo,
  selectNode,
  undo,
  type ApplyCommandOptions,
  type ComponentRegistry,
  type HistoryState,
  type SelectionState,
  type ViewDocument,
  type ViewNode,
} from '@viewfoundry/core';
import { validateProps } from '@viewfoundry/schema';

export type StudioMode = 'edit' | 'live';
export type EditSubMode = 'component';

export type EditorStore = {
  document: ViewDocument;
  history: HistoryState;
  selection: SelectionState;
  registry: ComponentRegistry;
  paletteFilter: string;
  studioMode: StudioMode;
  editSubMode: EditSubMode;
  setRegistry: (registry: ComponentRegistry) => void;
  setDocument: (document: ViewDocument) => void;
  setStudioMode: (mode: StudioMode) => void;
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;
  insertComponent: (type: string, parentId?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  updateProp: (key: string, value: unknown) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setPaletteFilter: (filter: string) => void;
};

function applyDocument(
  set: (partial: Partial<EditorStore> | ((state: EditorStore) => Partial<EditorStore>)) => void,
  get: () => EditorStore,
  document: ViewDocument,
) {
  const { history } = get();
  set({
    document,
    history: pushHistory(history, document),
  });
}

export function resolveInsertParentId(
  document: ViewDocument,
  registry: ComponentRegistry,
  selection: SelectionState,
  parentId?: string,
): string {
  let targetParentId = parentId ?? 'root';
  const selectedId = getPrimarySelection(selection);
  if (!parentId && selectedId) {
    const selected = findNode(document.root, selectedId);
    const selectedDef = selected ? registry.get(selected.type) : undefined;
    if (selected && selectedDef?.acceptsChildren) {
      targetParentId = selectedId;
    }
  }
  return targetParentId;
}

function createApplyOptions(registry: ComponentRegistry): ApplyCommandOptions {
  return {
    validateNodeProps: (node: ViewNode) => {
      const def = registry.get(node.type);
      if (!def?.props) return { valid: true, issues: [] };
      return validateProps(def.props, node.props ?? {});
    },
  };
}

export function createEditorStore(
  registry: ComponentRegistry,
  initialDocument?: ViewDocument,
  onChange?: (document: ViewDocument) => void,
  options?: {
    defaultStudioMode?: StudioMode;
    onStudioModeChange?: (mode: StudioMode) => void;
  },
) {
  const doc = initialDocument ?? createDocument();
  const defaultStudioMode = options?.defaultStudioMode ?? 'edit';
  const onStudioModeChange = options?.onStudioModeChange;

  return create<EditorStore>((set, get) => ({
    document: doc,
    history: createHistory(doc),
    selection: createSelection(),
    registry,
    paletteFilter: '',
    studioMode: defaultStudioMode,
    editSubMode: 'component',

    setRegistry: (registry) => set({ registry }),

    setStudioMode: (mode) => {
      if (get().studioMode === mode) return;
      set({ studioMode: mode });
      onStudioModeChange?.(mode);
    },

    setDocument: (document) => {
      set({ document, history: createHistory(document), selection: createSelection() });
      onChange?.(document);
    },

    selectNode: (nodeId) => {
      set({
        selection: nodeId ? selectNode(get().selection, nodeId) : clearSelection(),
      });
    },

    clearSelection: () => set({ selection: clearSelection() }),

    insertComponent: (type, parentId) => {
      const { registry, document, selection } = get();
      const def = registry.get(type);
      if (!def) return;

      const targetParentId = resolveInsertParentId(document, registry, selection, parentId);
      const node = createNode(type, { ...(def.defaultProps ?? {}) });
      const result = applyCommand(
        document,
        { type: 'insertNode', payload: { parentId: targetParentId, node } },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: selectNode(createSelection(), node.id) });
        onChange?.(result.document);
      }
    },

    deleteSelected: () => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId || nodeId === 'root') return;
      const { registry, document } = get();
      const result = applyCommand(
        document,
        { type: 'deleteNode', payload: { nodeId } },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: clearSelection() });
        onChange?.(result.document);
      }
    },

    duplicateSelected: () => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId || nodeId === 'root') return;
      const { registry, document } = get();
      const result = applyCommand(
        document,
        { type: 'duplicateNode', payload: { nodeId } },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        onChange?.(result.document);
      }
    },

    updateProp: (key, value) => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId) return;
      const { registry, document } = get();
      const result = applyCommand(
        document,
        { type: 'setNodeProp', payload: { nodeId, key, value } },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        onChange?.(result.document);
      }
    },

    undo: () => {
      const { history } = get();
      if (!canUndo(history)) return;
      const next = undo(history);
      set({ history: next, document: next.present, selection: clearSelection() });
      onChange?.(next.present);
    },

    redo: () => {
      const { history } = get();
      if (!canRedo(history)) return;
      const next = redo(history);
      set({ history: next, document: next.present, selection: clearSelection() });
      onChange?.(next.present);
    },

    canUndo: () => canUndo(get().history),
    canRedo: () => canRedo(get().history),

    setPaletteFilter: (filter) => set({ paletteFilter: filter }),
  }));
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;
