import type { HistoryState, ViewDocument } from './types.js';

export function createHistory(document: ViewDocument): HistoryState {
  return { past: [], present: document, future: [] };
}

export function pushHistory(history: HistoryState, document: ViewDocument): HistoryState {
  if (document === history.present) return history;
  return {
    past: [...history.past, history.present],
    present: document,
    future: [],
  };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}
