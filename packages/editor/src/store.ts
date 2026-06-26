import { create } from 'zustand';
import {
  applyCommand,
  autoPlaceNextCell,
  canRedo,
  canUndo,
  clearSelection,
  createDocument,
  createHistory,
  createNode,
  createSelection,
  findNode,
  findNodeLocation,
  getPrimarySelection,
  isGridContainer,
  isPlacementInBounds,
  normalizePlacement,
  pushHistory,
  redo,
  resolveGridTracks,
  selectNode,
  sortChildrenByGridOrder,
  undo,
  type ApplyCommandOptions,
  type ComponentRegistry,
  type GridPlacement,
  type HistoryState,
  type SelectionState,
  type ViewDocument,
  type ViewNode,
} from '@viewfoundry/core';
import { validateProps } from '@viewfoundry/schema';

export type StudioMode = 'edit' | 'live';
export type EditSubMode = 'component';

export type InsertComponentOptions = {
  parentId?: string;
  layout?: GridPlacement;
};

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
  insertComponent: (type: string, options?: InsertComponentOptions) => void;
  moveNodeToCell: (nodeId: string, parentId: string, layout: GridPlacement) => void;
  nudgeNodeLayout: (nodeId: string, delta: { row?: number; column?: number }) => void;
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

function computeMoveIndex(parent: ViewNode, layout: GridPlacement, node: ViewNode): number {
  const siblings = (parent.children ?? []).filter((child) => child.id !== node.id);
  const sorted = sortChildrenByGridOrder([...siblings, { ...node, layout: { grid: layout } }]);
  return sorted.findIndex((child) => child.id === node.id);
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

    insertComponent: (type, options) => {
      const { registry, document, selection } = get();
      const def = registry.get(type);
      if (!def) return;

      let workingDoc = document;
      let targetParentId =
        options?.parentId ?? resolveInsertParentId(document, registry, selection);
      let layout = options?.layout;

      const isEmpty = !workingDoc.root.children || workingDoc.root.children.length === 0;
      if (isEmpty && !options?.parentId && !isGridContainer(type)) {
        const gridNode = createNode('Grid', { columns: 4, rows: 2, gap: 8 });
        const gridResult = applyCommand(
          workingDoc,
          { type: 'insertNode', payload: { parentId: 'root', node: gridNode } },
          registry,
          createApplyOptions(registry),
        );
        if (!gridResult.ok) return;
        workingDoc = gridResult.document;
        targetParentId = gridNode.id;
        layout = layout ?? { column: 1, row: 1, colSpan: 1, rowSpan: 1 };
      }

      const parent = findNode(workingDoc.root, targetParentId);
      if (parent && isGridContainer(parent.type) && !layout) {
        layout = autoPlaceNextCell(parent.children ?? [], resolveGridTracks(parent));
      }

      const node = createNode(type, { ...(def.defaultProps ?? {}) });
      const result = applyCommand(
        workingDoc,
        {
          type: 'insertNode',
          payload: { parentId: targetParentId, node, layout },
        },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: selectNode(createSelection(), node.id) });
        onChange?.(result.document);
      }
    },

    moveNodeToCell: (nodeId, parentId, layout) => {
      if (nodeId === 'root') return;
      const { registry, document } = get();
      const location = findNodeLocation(document.root, nodeId);
      const parent = findNode(document.root, parentId);
      if (!location || !parent || !isGridContainer(parent.type)) return;

      if (location.parent?.id === parentId) {
        const result = applyCommand(
          document,
          { type: 'setNodeLayout', payload: { nodeId, layout } },
          registry,
          createApplyOptions(registry),
        );
        if (result.ok) {
          applyDocument(set, get, result.document);
          onChange?.(result.document);
        }
        return;
      }

      const index = computeMoveIndex(parent, layout, location.node);
      const result = applyCommand(
        document,
        { type: 'moveNode', payload: { nodeId, parentId, index, layout } },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
        set({ selection: selectNode(get().selection, nodeId) });
        onChange?.(result.document);
      }
    },

    nudgeNodeLayout: (nodeId, delta) => {
      const { registry, document } = get();
      const location = findNodeLocation(document.root, nodeId);
      if (!location?.parent || !isGridContainer(location.parent.type)) return;

      const current = normalizePlacement(location.node.layout?.grid);
      const next = {
        column: current.column + (delta.column ?? 0),
        row: current.row + (delta.row ?? 0),
        colSpan: current.colSpan,
        rowSpan: current.rowSpan,
      };
      const tracks = resolveGridTracks(location.parent);
      if (!isPlacementInBounds(next, tracks)) return;

      const result = applyCommand(
        document,
        {
          type: 'setNodeLayout',
          payload: {
            nodeId,
            layout: {
              column: next.column,
              row: next.row,
              colSpan: next.colSpan,
              rowSpan: next.rowSpan,
            },
          },
        },
        registry,
        createApplyOptions(registry),
      );
      if (result.ok) {
        applyDocument(set, get, result.document);
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
