export {
  parseSourceFile,
  findJsxElementAt,
  buildSourceMap,
  validateSourceContent,
  extractJsxProps,
  type ParsedSourceFile,
  type ParsedJsxElement,
} from './parse.js';

export {
  patchDeleteElement,
  patchInsertElement,
  patchSetProp,
  patchMoveElement,
  applyPatchesToContent,
  validateAllowedChild,
  isAncestor,
} from './patch.js';

export {
  getElementIdentity,
  reconcileElementId,
  findElementByIdentity,
  type ElementIdentity,
} from './parse.js';

export {
  createFileHistory,
  pushFileHistory,
  undoFileHistory,
  redoFileHistory,
  canUndoFile,
  canRedoFile,
} from '@viewfoundry/core';

export type {
  SourceLocation,
  SourceElementId,
  SourceSelection,
  FilePatch,
  FileCommandResult,
  FileHistoryState,
} from '@viewfoundry/core';
