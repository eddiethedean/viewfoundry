export type {
  ViewDocument,
  ViewDocumentMeta,
  ViewNode,
  GridPlacement,
  NodeLayout,
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
  SetNodeLayoutPayload,
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
export { validateDocument, validateGridLayout } from './validation.js';
export type { ValidateDocumentOptions } from './validation.js';
export {
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  setNodeLayout,
  updateNodeProps,
  setNodeProp,
} from './commands.js';
export {
  isGridContainer,
  GRID_CONTAINER_TYPES,
  resolveGridTracks,
  sortChildrenByGridOrder,
  autoPlaceNextCell,
  placementToCss,
  gridContainerStyle,
  normalizePlacement,
  rectsOverlap,
  isPlacementInBounds,
  gridDropId,
  parseGridDropId,
} from './grid.js';
export type { GridTracks, PlacementRect, GridContainerType } from './grid.js';
export { createHistory, pushHistory, undo, redo, canUndo, canRedo } from './history.js';
export {
  createSelection,
  selectNode,
  toggleNodeSelection,
  clearSelection,
  isNodeSelected,
  getPrimarySelection,
} from './selection.js';
export { applyCommand } from './apply-command.js';
export type { DocumentCommand, ApplyCommandOptions } from './apply-command.js';
