import { describe, expect, it } from 'vitest';
import {
  createSelection,
  selectNode,
  toggleNodeSelection,
  clearSelection,
  isNodeSelected,
  getPrimarySelection,
} from '../src/index.js';

describe('selection', () => {
  it('selects a single node', () => {
    const selection = selectNode(createSelection(), 'node-1');
    expect(selection.selectedNodeIds).toEqual(['node-1']);
    expect(getPrimarySelection(selection)).toBe('node-1');
    expect(isNodeSelected(selection, 'node-1')).toBe(true);
    expect(isNodeSelected(selection, 'node-2')).toBe(false);
  });

  it('toggles node selection on and off', () => {
    let selection = createSelection();
    selection = toggleNodeSelection(selection, 'a');
    expect(selection.selectedNodeIds).toEqual(['a']);

    selection = toggleNodeSelection(selection, 'b');
    expect(selection.selectedNodeIds).toEqual(['a', 'b']);

    selection = toggleNodeSelection(selection, 'a');
    expect(selection.selectedNodeIds).toEqual(['b']);
  });

  it('clears selection', () => {
    const selection = clearSelection();
    expect(selection.selectedNodeIds).toEqual([]);
    expect(getPrimarySelection(selection)).toBeUndefined();
  });

  it('replaces selection when selecting a new node', () => {
    let selection = selectNode(createSelection(), 'first');
    selection = selectNode(selection, 'second');
    expect(selection.selectedNodeIds).toEqual(['second']);
  });
});
