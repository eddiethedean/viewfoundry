import type { FileHistoryState } from './file-types.js';

export function createFileHistory(files: Record<string, string>): FileHistoryState {
  return { past: [], present: { ...files }, future: [] };
}

export function pushFileHistory(
  history: FileHistoryState,
  files: Record<string, string>,
): FileHistoryState {
  if (filesEqual(history.present, files)) return history;
  return {
    past: [...history.past, { ...history.present }],
    present: { ...files },
    future: [],
  };
}

export function undoFileHistory(history: FileHistoryState): FileHistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: { ...previous },
    future: [{ ...history.present }, ...history.future],
  };
}

export function redoFileHistory(history: FileHistoryState): FileHistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, { ...history.present }],
    present: { ...next },
    future: history.future.slice(1),
  };
}

export function canUndoFile(history: FileHistoryState): boolean {
  return history.past.length > 0;
}

export function canRedoFile(history: FileHistoryState): boolean {
  return history.future.length > 0;
}

function filesEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}
