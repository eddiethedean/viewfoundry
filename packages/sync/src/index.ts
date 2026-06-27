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
} from './patch.js';

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
