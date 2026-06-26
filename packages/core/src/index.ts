export type {
  ViewDocument,
  ViewDocumentMeta,
  ViewNode,
  GridPlacement,
  NodeLayout,
  TokenReference,
  StyleValue,
  StyleTokenMap,
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
  SetStylePropPayload,
  UpdateNodeStylePayload,
  CommandResult,
} from './types.js';

export { createDocument, createNode, cloneNode } from './document.js';
export { documentTreeEqual } from './document-utils.js';
export {
  findNode,
  findNodeLocation,
  isDescendant,
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
  validateStyle,
  cloneStyle,
  resolveStyleValue,
  KNOWN_STYLE_KEYS,
  DISPLAY_VALUES,
  FLEX_DIRECTION_VALUES,
  ALIGN_ITEMS_VALUES,
  JUSTIFY_CONTENT_VALUES,
  TEXT_ALIGN_VALUES,
  OVERFLOW_VALUES,
  BORDER_STYLE_VALUES,
} from './style.js';
export {
  insertNode,
  deleteNode,
  duplicateNode,
  moveNode,
  setNodeLayout,
  updateNodeProps,
  setNodeProp,
  setStyleProp,
  updateNodeStyle,
} from './commands.js';
export {
  isGridContainer,
  GRID_CONTAINER_TYPES,
  resolveGridTracks,
  sortChildrenByGridOrder,
  autoPlaceNextCell,
  growGridRowsIfNeeded,
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
