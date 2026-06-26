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
  type CommandResult,
  type ComponentRegistry,
  type GridPlacement,
  type HistoryState,
  type SelectionState,
  type StyleTokenMap,
  type StyleValue,
  type ViewDocument,
  type ViewNode,
} from '@viewfoundry/core';
import { validateProps } from '@viewfoundry/schema';
import { documentTreeEqual } from './sync-utils.js';

export type StudioMode = 'edit' | 'live';
export type EditSubMode = 'component' | 'style';

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
  lastError: string | null;
  isDragging: boolean;
  setRegistry: (registry: ComponentRegistry) => void;
  setDocument: (document: ViewDocument) => void;
  syncDocument: (document: ViewDocument) => void;
  revertDocument: (document: ViewDocument) => void;
  setStudioMode: (mode: StudioMode) => void;
  setEditSubMode: (mode: EditSubMode) => void;
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;
  insertComponent: (type: string, options?: InsertComponentOptions) => void;
  moveNodeToCell: (nodeId: string, parentId: string, layout: GridPlacement) => void;
  nudgeNodeLayout: (nodeId: string, delta: { row?: number; column?: number }) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  updateProp: (key: string, value: unknown) => void;
  setStyleProp: (nodeId: string, key: string, value: StyleValue | undefined) => void;
  updateStyle: (nodeId: string, style: StyleTokenMap) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setPaletteFilter: (filter: string) => void;
  setDragging: (dragging: boolean) => void;
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

function handleCommandResult(
  set: (partial: Partial<EditorStore> | ((state: EditorStore) => Partial<EditorStore>)) => void,
  get: () => EditorStore,
  result: CommandResult<unknown>,
  onChange: ((document: ViewDocument) => void) | undefined,
  onSuccess?: () => Partial<EditorStore>,
): boolean {
  if (result.ok) {
    applyDocument(set, get, result.document);
    onChange?.(result.document);
    set({ lastError: null, ...(onSuccess?.() ?? {}) });
    return true;
  }
  set({ lastError: result.error });
  return false;
}

export function resolveInsertParentId(
  document: ViewDocument,
  registry: ComponentRegistry,
  selection: SelectionState,
  parentId?: string,
): string {
  if (parentId) return parentId;

  const selectedId = getPrimarySelection(selection);
  if (selectedId) {
    const selected = findNode(document.root, selectedId);
    const selectedDef = selected ? registry.get(selected.type) : undefined;
    if (selected && selectedDef?.acceptsChildren) {
      return selectedId;
    }
  }

  const rootChildren = document.root.children ?? [];
  if (rootChildren.length === 1 && isGridContainer(rootChildren[0].type)) {
    return rootChildren[0].id;
  }

  return 'root';
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

function preserveSelection(selection: SelectionState, document: ViewDocument): SelectionState {
  const selectedId = getPrimarySelection(selection);
  if (!selectedId) return selection;
  if (findNode(document.root, selectedId)) return selection;
  return clearSelection();
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
    lastError: null,
    isDragging: false,

    setRegistry: (registry) => set({ registry }),

    setStudioMode: (mode) => {
      if (get().studioMode === mode) return;
      set({ studioMode: mode });
      onStudioModeChange?.(mode);
    },

    setEditSubMode: (mode) => {
      if (get().editSubMode === mode) return;
      set({ editSubMode: mode, lastError: null });
    },

    setDocument: (document) => {
      set({
        document,
        history: createHistory(document),
        selection: createSelection(),
        lastError: null,
      });
      onChange?.(document);
    },

    syncDocument: (document) => {
      const state = get();
      if (documentTreeEqual(state.document, document)) {
        if (
          state.document.version !== document.version ||
          JSON.stringify(state.document.meta ?? null) !== JSON.stringify(document.meta ?? null)
        ) {
          set({
            document: {
              ...state.document,
              version: document.version,
              meta: document.meta,
            },
          });
        }
        return;
      }
      const { history } = state;
      set({
        document,
        history: {
          past: [...history.past, history.present],
          present: document,
          future: [],
        },
        selection: preserveSelection(state.selection, document),
        lastError: null,
      });
    },

    revertDocument: (document) => {
      const state = get();
      set({
        document,
        history: { ...state.history, present: document },
      });
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
      if (!def) {
        set({ lastError: `Unknown component type: ${type}` });
        return;
      }

      let workingDoc = document;
      let targetParentId = resolveInsertParentId(document, registry, selection, options?.parentId);
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
        if (!gridResult.ok) {
          set({ lastError: gridResult.error });
          return;
        }
        workingDoc = gridResult.document;
        targetParentId = gridNode.id;
        layout = layout ?? { column: 1, row: 1, colSpan: 1, rowSpan: 1 };
      }

      const parent = findNode(workingDoc.root, targetParentId);
      if (parent && isGridContainer(parent.type) && !layout) {
        layout = autoPlaceNextCell(parent.children ?? [], resolveGridTracks(parent));
      }

      const node = createNode(type, { ...(def.defaultProps ?? {}) });
      handleCommandResult(
        set,
        get,
        applyCommand(
          workingDoc,
          {
            type: 'insertNode',
            payload: { parentId: targetParentId, node, layout },
          },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
        () => ({ selection: selectNode(createSelection(), node.id) }),
      );
    },

    moveNodeToCell: (nodeId, parentId, layout) => {
      if (nodeId === 'root') return;
      const { registry, document } = get();
      const location = findNodeLocation(document.root, nodeId);
      const parent = findNode(document.root, parentId);
      if (!location || !parent || !isGridContainer(parent.type)) return;

      if (location.parent?.id === parentId) {
        handleCommandResult(
          set,
          get,
          applyCommand(
            document,
            { type: 'setNodeLayout', payload: { nodeId, layout } },
            registry,
            createApplyOptions(registry),
          ),
          onChange,
        );
        return;
      }

      const index = computeMoveIndex(parent, layout, location.node);
      handleCommandResult(
        set,
        get,
        applyCommand(
          document,
          { type: 'moveNode', payload: { nodeId, parentId, index, layout } },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
        () => ({ selection: selectNode(get().selection, nodeId) }),
      );
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

      handleCommandResult(
        set,
        get,
        applyCommand(
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
        ),
        onChange,
      );
    },

    deleteSelected: () => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId || nodeId === 'root') return;
      const { registry, document } = get();
      handleCommandResult(
        set,
        get,
        applyCommand(
          document,
          { type: 'deleteNode', payload: { nodeId } },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
        () => ({ selection: clearSelection() }),
      );
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
        const duplicateId = typeof result.data === 'string' ? result.data : undefined;
        set({
          lastError: null,
          ...(duplicateId ? { selection: selectNode(get().selection, duplicateId) } : {}),
        });
      } else {
        set({ lastError: result.error });
      }
    },

    updateProp: (key, value) => {
      const nodeId = getPrimarySelection(get().selection);
      if (!nodeId) return;
      const { registry, document } = get();
      handleCommandResult(
        set,
        get,
        applyCommand(
          document,
          { type: 'setNodeProp', payload: { nodeId, key, value } },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
      );
    },

    setStyleProp: (nodeId, key, value) => {
      if (!nodeId) return;
      const { registry, document } = get();
      handleCommandResult(
        set,
        get,
        applyCommand(
          document,
          { type: 'setStyleProp', payload: { nodeId, key, value } },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
      );
    },

    updateStyle: (nodeId, style) => {
      if (!nodeId) return;
      const { registry, document } = get();
      handleCommandResult(
        set,
        get,
        applyCommand(
          document,
          { type: 'updateNodeStyle', payload: { nodeId, style } },
          registry,
          createApplyOptions(registry),
        ),
        onChange,
      );
    },

    undo: () => {
      const { history, selection } = get();
      if (!canUndo(history)) return;
      const next = undo(history);
      set({
        history: next,
        document: next.present,
        selection: preserveSelection(selection, next.present),
        lastError: null,
      });
      onChange?.(next.present);
    },

    redo: () => {
      const { history, selection } = get();
      if (!canRedo(history)) return;
      const next = redo(history);
      set({
        history: next,
        document: next.present,
        selection: preserveSelection(selection, next.present),
        lastError: null,
      });
      onChange?.(next.present);
    },

    canUndo: () => canUndo(get().history),
    canRedo: () => canRedo(get().history),

    setPaletteFilter: (filter) => set({ paletteFilter: filter }),

    setDragging: (dragging) => set({ isDragging: dragging }),
  }));
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;
