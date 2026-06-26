import type { SelectionState } from './types.js';

export function createSelection(selectedNodeIds: string[] = []): SelectionState {
  return { selectedNodeIds };
}

export function selectNode(_selection: SelectionState, nodeId: string): SelectionState {
  return { selectedNodeIds: [nodeId] };
}

export function toggleNodeSelection(selection: SelectionState, nodeId: string): SelectionState {
  if (selection.selectedNodeIds.includes(nodeId)) {
    return {
      selectedNodeIds: selection.selectedNodeIds.filter((id) => id !== nodeId),
    };
  }
  return { selectedNodeIds: [...selection.selectedNodeIds, nodeId] };
}

export function clearSelection(): SelectionState {
  return { selectedNodeIds: [] };
}

export function isNodeSelected(selection: SelectionState, nodeId: string): boolean {
  return selection.selectedNodeIds.includes(nodeId);
}

export function getPrimarySelection(selection: SelectionState): string | undefined {
  return selection.selectedNodeIds[0];
}
