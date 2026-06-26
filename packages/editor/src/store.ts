import { create } from 'zustand';
import {
  canRedo,
  canUndo,
  clearSelection,
  createDocument,
  createHistory,
  createNode,
  createSelection,
  deleteNode,
  duplicateNode,
  findNode,
  getPrimarySelection,
  insertNode,
  pushHistory,
  redo,
  selectNode,
  setNodeProp,
  undo,
  type ComponentRegistry,
  type HistoryState,
  type SelectionState,
  type ViewDocument,
} from '@viewfoundry/core';

export type EditorStore = {
  document: ViewDocument;
  history: HistoryState;
  selection: SelectionState;
  registry: ComponentRegistry;
  paletteFilter: string;
  setRegistry: (registry: ComponentRegistry) => void;
  setDocument: (document: ViewDocument) => void;
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

export function createEditorStore(
  registry: ComponentRegistry,
  initialDocument?: ViewDocument,
  onChange?: (document: ViewDocument) => void,
) {
  const doc = initialDocument ?? createDocument();

  return create<EditorStore>((set, get) => ({
    document: doc,
    history: createHistory(doc),
    selection: createSelection(),
    registry,
    paletteFilter: '',

    setRegistry: (registry) => set({ registry }),

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

      let targetParentId = parentId ?? 'root';
      const selectedId = getPrimarySelection(selection);
      if (!parentId && selectedId) {
        const selected = findNode(document.root, selectedId);
        const selectedDef = selected ? registry.get(selected.type) : undefined;
        if (selected && selectedDef?.acceptsChildren) {
          targetParentId = selectedId;
        }
      }

      const node = createNode(type, { ...(def.defaultProps ?? {}) });
      const result = insertNode(document, { parentId: targetParentId, node });
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: selectNode(createSelection(), node.id) });
        onChange?.(result.document);
      }
    },

    deleteSelected: () => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId || nodeId === 'root') return;
      const result = deleteNode(get().document, { nodeId });
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: clearSelection() });
        onChange?.(result.document);
      }
    },

    duplicateSelected: () => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId || nodeId === 'root') return;
      const result = duplicateNode(get().document, { nodeId });
      if (result.ok) {
        applyDocument(set, get, result.document);
        onChange?.(result.document);
      }
    },

    updateProp: (key, value) => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId) return;
      const result = setNodeProp(get().document, { nodeId, key, value });
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
