import type {
  CommandResult,
  DeleteNodePayload,
  DuplicateNodePayload,
  InsertNodePayload,
  MoveNodePayload,
  SetNodePropPayload,
  UpdateNodePropsPayload,
  ViewDocument,
} from './types.js';
import { cloneNode } from './document.js';
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

export function insertNode(document: ViewDocument, payload: InsertNodePayload): CommandResult {
  const parent = findNode(document.root, payload.parentId);
  if (!parent) {
    return failure(`Parent node not found: ${payload.parentId}`);
  }
  const newRoot = insertNodeInTree(document.root, payload.parentId, payload.node, payload.index);
  return success({ ...document, root: newRoot });
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

export function duplicateNode(document: ViewDocument, payload: DuplicateNodePayload): CommandResult {
  const location = findNodeLocation(document.root, payload.nodeId);
  if (!location) {
    return failure(`Node not found: ${payload.nodeId}`);
  }
  if (!location.parent) {
    return failure('Cannot duplicate root node');
  }
  const duplicate = cloneNode(location.node);
  const newRoot = insertNodeInTree(
    document.root,
    location.parent.id,
    duplicate,
    location.index + 1,
  );
  return success({ ...document, root: newRoot });
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
  newRoot = insertNodeInTree(newRoot, payload.parentId, node, payload.index);
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
