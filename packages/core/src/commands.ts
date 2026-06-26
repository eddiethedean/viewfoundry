import type {
  CommandResult,
  DeleteNodePayload,
  DuplicateNodePayload,
  GridPlacement,
  InsertNodePayload,
  MoveNodePayload,
  SetNodeLayoutPayload,
  SetNodePropPayload,
  SetStylePropPayload,
  StyleTokenMap,
  UpdateNodePropsPayload,
  UpdateNodeStylePayload,
  ViewDocument,
  ViewNode,
} from './types.js';
import { cloneNode } from './document.js';
import {
  autoPlaceNextCell,
  growGridRowsIfNeeded,
  isGridContainer,
  placementExceedsMaxTracks,
  resolveGridTracks,
  sortChildrenByGridOrder,
  normalizePlacement,
} from './grid.js';
import {
  findNode,
  findNodeLocation,
  insertNodeInTree,
  isDescendant,
  removeNodeFromTree,
  updateNodeInTree,
} from './nodes.js';

function success(document: ViewDocument): CommandResult {
  return { ok: true, document };
}

function failure(error: string): CommandResult<never> {
  return { ok: false, error };
}

function reorderParentChildren(root: ViewNode, parentId: string): ViewNode {
  return updateNodeInTree(root, parentId, (parent) => {
    if (!isGridContainer(parent.type) || !parent.children) return parent;
    return { ...parent, children: sortChildrenByGridOrder(parent.children) };
  });
}

function resolveEffectivePlacement(node: ViewNode, partial?: GridPlacement): GridPlacement {
  const existing = normalizePlacement(node.layout?.grid);
  if (partial === undefined) return existing;
  return {
    column: partial.column ?? existing.column,
    row: partial.row ?? existing.row,
    colSpan: partial.colSpan ?? existing.colSpan,
    rowSpan: partial.rowSpan ?? existing.rowSpan,
  };
}

function applyLayoutToNode(node: ViewNode, layout?: GridPlacement): ViewNode {
  if (layout === undefined) return node;
  return {
    ...node,
    layout: { ...node.layout, grid: resolveEffectivePlacement(node, layout) },
  };
}

function gridLimitFailure(parentType: string): CommandResult<never> {
  return failure(`Grid placement exceeds maximum of 64 tracks for "${parentType}"`);
}

function clearGridLayout(node: ViewNode): ViewNode {
  if (!node.layout?.grid) return node;
  const { grid: _grid, ...restLayout } = node.layout;
  if (Object.keys(restLayout).length === 0) {
    const { layout: _layout, ...rest } = node;
    return rest;
  }
  return { ...node, layout: restLayout };
}

export function insertNode(document: ViewDocument, payload: InsertNodePayload): CommandResult {
  const parent = findNode(document.root, payload.parentId);
  if (!parent) {
    return failure(`Parent node not found: ${payload.parentId}`);
  }
  if (findNode(document.root, payload.node.id)) {
    return failure(`Duplicate node ID: ${payload.node.id}`);
  }
  let root = document.root;
  if (payload.layout && isGridContainer(parent.type)) {
    const effective = resolveEffectivePlacement(payload.node, payload.layout);
    if (placementExceedsMaxTracks(parent.type, effective)) {
      return gridLimitFailure(parent.type);
    }
    root = growGridRowsIfNeeded(root, payload.parentId, effective);
  }
  let node = payload.node;
  if (isGridContainer(parent.type)) {
    if (payload.layout) {
      node = applyLayoutToNode(node, payload.layout);
    } else if (!node.layout?.grid) {
      const tracks = resolveGridTracks(parent);
      const placement = autoPlaceNextCell(parent.children ?? [], tracks);
      node = applyLayoutToNode(node, placement);
    }
  } else {
    node = clearGridLayout(node);
  }
  const newRoot = insertNodeInTree(root, payload.parentId, node, payload.index);
  const orderedRoot = isGridContainer(parent.type)
    ? reorderParentChildren(newRoot, payload.parentId)
    : newRoot;
  return success({ ...document, root: orderedRoot });
}

export function deleteNode(document: ViewDocument, payload: DeleteNodePayload): CommandResult {
  if (payload.nodeId === document.root.id) {
    return failure('Cannot delete root node');
  }
  const location = findNodeLocation(document.root, payload.nodeId);
  if (!location) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = removeNodeFromTree(document.root, payload.nodeId);
  const orderedRoot =
    location?.parent && isGridContainer(location.parent.type)
      ? reorderParentChildren(newRoot, location.parent.id)
      : newRoot;
  return success({ ...document, root: orderedRoot });
}

export function duplicateNode(
  document: ViewDocument,
  payload: DuplicateNodePayload,
): CommandResult<string> {
  const location = findNodeLocation(document.root, payload.nodeId);
  if (!location) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  if (!location.parent) {
    return failure('Cannot duplicate root node');
  }
  const duplicate = isGridContainer(location.parent.type)
    ? (() => {
        const node = cloneNode(location.node);
        const tracks = resolveGridTracks(location.parent);
        const placement = autoPlaceNextCell(location.parent.children ?? [], tracks);
        node.layout = { grid: placement };
        return node;
      })()
    : clearGridLayout(cloneNode(location.node));
  const root = growGridRowsIfNeeded(
    document.root,
    location.parent.id,
    duplicate.layout?.grid ?? { column: 1, row: 1 },
  );
  const newRoot = insertNodeInTree(root, location.parent.id, duplicate, location.index + 1);
  const orderedRoot = isGridContainer(location.parent.type)
    ? reorderParentChildren(newRoot, location.parent.id)
    : newRoot;
  return { ok: true, document: { ...document, root: orderedRoot }, data: duplicate.id };
}

export function moveNode(document: ViewDocument, payload: MoveNodePayload): CommandResult {
  if (payload.nodeId === document.root.id) {
    return failure('Cannot move root node');
  }
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const parent = findNode(document.root, payload.parentId);
  if (!parent) {
    return failure(`Parent node not found: ${payload.parentId}`);
  }
  if (payload.nodeId === payload.parentId) {
    return failure('Cannot move node into itself');
  }
  if (isDescendant(document.root, payload.nodeId, payload.parentId)) {
    return failure('Cannot move node into its own descendant');
  }
  const fromLocation = findNodeLocation(document.root, payload.nodeId);
  let insertIndex = payload.index;
  if (fromLocation?.parent?.id === payload.parentId && fromLocation.index < insertIndex) {
    insertIndex -= 1;
  }
  let newRoot = removeNodeFromTree(document.root, payload.nodeId);
  let nodeToInsert = node;
  if (payload.layout !== undefined) {
    nodeToInsert = applyLayoutToNode(node, payload.layout);
  } else if (!isGridContainer(parent.type)) {
    nodeToInsert = clearGridLayout(node);
  }
  if (isGridContainer(parent.type)) {
    const effective = resolveEffectivePlacement(
      nodeToInsert,
      payload.layout ?? nodeToInsert.layout?.grid,
    );
    if (placementExceedsMaxTracks(parent.type, effective)) {
      return gridLimitFailure(parent.type);
    }
    newRoot = growGridRowsIfNeeded(newRoot, payload.parentId, effective);
  }
  newRoot = insertNodeInTree(newRoot, payload.parentId, nodeToInsert, insertIndex);
  if (!findNode(newRoot, payload.nodeId)) {
    return failure('Move failed: node was lost during insertion');
  }
  const orderedRoot = isGridContainer(parent.type)
    ? reorderParentChildren(newRoot, payload.parentId)
    : newRoot;
  return success({ ...document, root: orderedRoot });
}

export function setNodeLayout(
  document: ViewDocument,
  payload: SetNodeLayoutPayload,
): CommandResult {
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const location = findNodeLocation(document.root, payload.nodeId);
  let root = document.root;
  if (location?.parent && isGridContainer(location.parent.type)) {
    const effective = resolveEffectivePlacement(node, payload.layout);
    if (placementExceedsMaxTracks(location.parent.type, effective)) {
      return gridLimitFailure(location.parent.type);
    }
    root = growGridRowsIfNeeded(root, location.parent.id, effective);
  }
  let newRoot = updateNodeInTree(root, payload.nodeId, (n) => applyLayoutToNode(n, payload.layout));
  if (location?.parent && isGridContainer(location.parent.type)) {
    newRoot = reorderParentChildren(newRoot, location.parent.id);
  }
  return success({ ...document, root: newRoot });
}

export function updateNodeProps(
  document: ViewDocument,
  payload: UpdateNodePropsPayload,
): CommandResult {
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = updateNodeInTree(document.root, payload.nodeId, (n) => ({
    ...n,
    props: { ...payload.props },
  }));
  return success({ ...document, root: newRoot });
}

export function setNodeProp(document: ViewDocument, payload: SetNodePropPayload): CommandResult {
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = updateNodeInTree(document.root, payload.nodeId, (n) => ({
    ...n,
    props: { ...(n.props ?? {}), [payload.key]: payload.value },
  }));
  return success({ ...document, root: newRoot });
}

function applyStyleToNode(node: ViewNode, style: StyleTokenMap | undefined): ViewNode {
  if (!style || Object.keys(style).length === 0) {
    const { style: _style, ...rest } = node;
    return rest;
  }
  return { ...node, style: { ...style } };
}

export function setStyleProp(document: ViewDocument, payload: SetStylePropPayload): CommandResult {
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = updateNodeInTree(document.root, payload.nodeId, (n) => {
    const current = { ...(n.style ?? {}) };
    if (payload.value === undefined || payload.value === null) {
      delete current[payload.key];
    } else {
      current[payload.key] = payload.value;
    }
    return applyStyleToNode(n, Object.keys(current).length > 0 ? current : undefined);
  });
  return success({ ...document, root: newRoot });
}

export function updateNodeStyle(
  document: ViewDocument,
  payload: UpdateNodeStylePayload,
): CommandResult {
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = updateNodeInTree(document.root, payload.nodeId, (n) => {
    const merged = { ...(n.style ?? {}), ...payload.style };
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === null) {
        delete merged[key];
      }
    }
    return applyStyleToNode(n, Object.keys(merged).length > 0 ? merged : undefined);
  });
  return success({ ...document, root: newRoot });
}
