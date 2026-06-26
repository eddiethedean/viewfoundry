import type {
  CommandResult,
  DeleteNodePayload,
  DuplicateNodePayload,
  GridPlacement,
  InsertNodePayload,
  MoveNodePayload,
  SetNodeLayoutPayload,
  SetNodePropPayload,
  UpdateNodePropsPayload,
  ViewDocument,
  ViewNode,
} from './types.js';
import { cloneNode } from './document.js';
import {
  autoPlaceNextCell,
  isGridContainer,
  resolveGridTracks,
  sortChildrenByGridOrder,
} from './grid.js';
import {
  findNode,
  findNodeLocation,
  insertNodeInTree,
  removeNodeFromTree,
  updateNodeInTree,
} from './nodes.js';

function success(document: ViewDocument): CommandResult {
  return { ok: true, document };
}

function failure(error: string): CommandResult {
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
  let node = payload.node;
  if (payload.layout) {
    node = applyLayoutToNode(node, payload.layout);
  } else if (!isGridContainer(parent.type)) {
    node = clearGridLayout(node);
  }
  const newRoot = insertNodeInTree(document.root, payload.parentId, node, payload.index);
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
): CommandResult {
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
  const newRoot = insertNodeInTree(
    document.root,
    location.parent.id,
    duplicate,
    location.index + 1,
  );
  const orderedRoot = isGridContainer(location.parent.type)
    ? reorderParentChildren(newRoot, location.parent.id)
    : newRoot;
  return success({ ...document, root: orderedRoot });
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
  let newRoot = removeNodeFromTree(document.root, payload.nodeId);
  let nodeToInsert = node;
  if (payload.layout !== undefined) {
    nodeToInsert = applyLayoutToNode(node, payload.layout);
  } else if (!isGridContainer(parent.type)) {
    nodeToInsert = clearGridLayout(node);
  }
  newRoot = insertNodeInTree(newRoot, payload.parentId, nodeToInsert, payload.index);
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
