import type { ViewNode } from './types.js';

export type NodeLocation = {
  node: ViewNode;
  parent: ViewNode | null;
  index: number;
};

export function findNode(root: ViewNode, nodeId: string): ViewNode | undefined {
  if (root.id === nodeId) return root;
  if (!root.children) return undefined;
  for (const child of root.children) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }
  return undefined;
}

export function findNodeLocation(root: ViewNode, nodeId: string): NodeLocation | undefined {
  if (root.id === nodeId) {
    return { node: root, parent: null, index: -1 };
  }
  if (!root.children) return undefined;
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (child.id === nodeId) {
      return { node: child, parent: root, index: i };
    }
    const found = findNodeLocation(child, nodeId);
    if (found) return found;
  }
  return undefined;
}

export function walkNodes(
  root: ViewNode,
  visitor: (node: ViewNode, parent: ViewNode | null) => void,
): void {
  function walk(node: ViewNode, parent: ViewNode | null) {
    visitor(node, parent);
    if (node.children) {
      for (const child of node.children) {
        walk(child, node);
      }
    }
  }
  walk(root, null);
}

export function collectNodeIds(root: ViewNode): string[] {
  const ids: string[] = [];
  walkNodes(root, (node) => ids.push(node.id));
  return ids;
}

export function updateNodeInTree(
  root: ViewNode,
  nodeId: string,
  updater: (node: ViewNode) => ViewNode,
): ViewNode {
  if (root.id === nodeId) {
    return updater(root);
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, nodeId, updater)),
  };
}

export function removeNodeFromTree(root: ViewNode, nodeId: string): ViewNode {
  if (root.id === nodeId) {
    throw new Error('Cannot remove root node');
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== nodeId)
      .map((child) => removeNodeFromTree(child, nodeId)),
  };
}

export function insertNodeInTree(
  root: ViewNode,
  parentId: string,
  node: ViewNode,
  index?: number,
): ViewNode {
  if (root.id === parentId) {
    const children = [...(root.children ?? [])];
    const insertAt = index ?? children.length;
    children.splice(insertAt, 0, node);
    return { ...root, children };
  }
  if (!root.children) return root;
  return {
    ...root,
    children: root.children.map((child) => insertNodeInTree(child, parentId, node, index)),
  };
}
