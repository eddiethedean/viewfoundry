export type {
  ViewDocument,
  ViewDocumentMeta,
  ViewNode,
  PropField,
  PropSchema,
  ComponentDefinition,
  ComponentRegistry,
  SelectionState,
  HistoryState,
  ValidationIssue,
  ValidationResult,
  InsertNodePayload,
  DeleteNodePayload,
  DuplicateNodePayload,
  MoveNodePayload,
  UpdateNodePropsPayload,
  SetNodePropPayload,
  CommandResult,
} from './types.js';

export { createDocument, createNode, cloneNode } from './document.js';
export {
  findNode,
  findNodeLocation,
  walkNodes,
  collectNodeIds,
  updateNodeInTree,
  removeNodeFromTree,
  insertNodeInTree,
} from './nodes.js';
export type { NodeLocation } from './nodes.js';
export { createRegistry } from './registry.js';
export { validateDocument } from './validation.js';
export type { ValidateDocumentOptions } from './validation.js';
export {
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  updateNodeProps,
  setNodeProp,
} from './commands.js';
export {
  createHistory,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
} from './history.js';
export {
  createSelection,
  selectNode,
  toggleNodeSelection,
  clearSelection,
  isNodeSelected,
  getPrimarySelection,
} from './selection.js';
