import { describe, expect, it } from 'vitest';
import {
  canRedoFile,
  canUndoFile,
  createFileHistory,
  pushFileHistory,
  redoFileHistory,
  undoFileHistory,
} from './file-history.js';

describe('file history', () => {
  it('pushes and undoes file snapshots', () => {
    let history = createFileHistory({ 'a.tsx': 'v1' });
    history = pushFileHistory(history, { 'a.tsx': 'v2' });
    expect(canUndoFile(history)).toBe(true);
    history = undoFileHistory(history);
    expect(history.present['a.tsx']).toBe('v1');
    expect(canRedoFile(history)).toBe(true);
    history = redoFileHistory(history);
    expect(history.present['a.tsx']).toBe('v2');
  });

  it('caps past depth at default limit', () => {
    let history = createFileHistory({ 'a.tsx': 'v0' });
    for (let i = 1; i <= 55; i++) {
      history = pushFileHistory(history, { 'a.tsx': `v${i}` });
    }
    expect(history.past.length).toBeLessThanOrEqual(50);
    expect(history.present['a.tsx']).toBe('v55');
  });
});
