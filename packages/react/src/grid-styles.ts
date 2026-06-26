import type { CSSProperties } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import {
  gridContainerStyle,
  isGridContainer,
  placementToCss,
  resolveGridTracks,
} from '@viewfoundry/core';

export function getChildPlacementStyle(
  parent: ViewNode | null | undefined,
  node: ViewNode,
): CSSProperties | undefined {
  if (!parent || !isGridContainer(parent.type) || !node.layout?.grid) {
    return undefined;
  }
  return placementToCss(node.layout.grid) as CSSProperties;
}

export function getGridContainerStyle(node: ViewNode): CSSProperties | undefined {
  if (!isGridContainer(node.type)) return undefined;
  return gridContainerStyle(resolveGridTracks(node)) as CSSProperties;
}

export function getGridPlacementClass(parent: ViewNode | null | undefined): string {
  return parent && isGridContainer(parent.type) ? ' vf-grid-child' : '';
}
