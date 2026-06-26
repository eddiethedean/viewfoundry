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
  resolveGridTracks,
  sortChildrenByGridOrder,
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

function applyLayoutToNode(node: ViewNode, layout?: GridPlacement): ViewNode {
  if (layout === undefined) return node;
  return {
    ...node,
    layout: { ...node.layout, grid: layout },
  };
}

function clearGridLayout(node: ViewNode): ViewNode {
  if (!node.layout?.grid) return node;
  const { grid: _grid, ...restLayout } = node.layout;
  return {
    ...node,
    ...(Object.keys(restLayout).length > 0 ? { layout: restLayout } : {}),
  };
}

export function insertNode(document: ViewDocument, payload: InsertNodePayload): CommandResult {
  const parent = findNode(document.root, payload.parentId);
  if (!parent) {
    return failure(`Parent node not found: ${payload.parentId}`);
  }
  let root = document.root;
  if (payload.layout && isGridContainer(parent.type)) {
    root = growGridRowsIfNeeded(root, payload.parentId, payload.layout);
  }
  let node = payload.node;
  if (payload.layout) {
    node = applyLayoutToNode(node, payload.layout);
  } else if (!isGridContainer(parent.type)) {
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
  const node = findNode(document.root, payload.nodeId);
  if (!node) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  const newRoot = removeNodeFromTree(document.root, payload.nodeId);
  return success({ ...document, root: newRoot });
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
  const duplicate = cloneNode(location.node);
  if (isGridContainer(location.parent.type)) {
    const tracks = resolveGridTracks(location.parent);
    const placement = autoPlaceNextCell(location.parent.children ?? [], tracks);
    duplicate.layout = { grid: placement };
  }
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
  let newRoot = removeNodeFromTree(document.root, payload.nodeId);
  let nodeToInsert = node;
  if (payload.layout !== undefined) {
    nodeToInsert = applyLayoutToNode(node, payload.layout);
  } else if (!isGridContainer(parent.type)) {
    nodeToInsert = clearGridLayout(node);
  }
  newRoot = insertNodeInTree(newRoot, payload.parentId, nodeToInsert, payload.index);
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
  let newRoot = updateNodeInTree(document.root, payload.nodeId, (n) =>
    applyLayoutToNode(n, payload.layout),
  );
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
    if (payload.value === undefined) {
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
    return applyStyleToNode(n, Object.keys(merged).length > 0 ? merged : undefined);
  });
  return success({ ...document, root: newRoot });
}
