import { nanoid } from 'nanoid';
import { cloneStyle } from './style.js';
import type { NodeLayout, StyleTokenMap, ViewDocument, ViewNode } from './types.js';

export function createDocument(overrides?: Partial<ViewDocument>): ViewDocument {
  return {
    version: '0.1',
    root: {
      id: 'root',
      type: 'Root',
      props: {},
      children: [],
    },
    ...overrides,
  };
}

export function createNode(
  type: string,
  props?: Record<string, unknown>,
  children?: ViewNode[],
  id?: string,
  layout?: NodeLayout,
  style?: StyleTokenMap,
): ViewNode {
  return {
    id: id ?? nanoid(8),
    type,
    ...(props && Object.keys(props).length > 0 ? { props } : {}),
    ...(children && children.length > 0 ? { children } : {}),
    ...(layout ? { layout: cloneLayout(layout) } : {}),
    ...(style && Object.keys(style).length > 0 ? { style: cloneStyle(style) } : {}),
  };
}

function cloneLayout(layout: NodeLayout): NodeLayout {
  return {
    ...(layout.grid ? { grid: { ...layout.grid } } : {}),
  };
}

export function cloneNode(node: ViewNode, idGenerator: () => string = () => nanoid(8)): ViewNode {
  return {
    id: idGenerator(),
    type: node.type,
    ...(node.props ? { props: structuredClone(node.props) } : {}),
    ...(node.layout ? { layout: cloneLayout(node.layout) } : {}),
    ...(node.style ? { style: cloneStyle(node.style) } : {}),
    ...(node.children
      ? { children: node.children.map((child) => cloneNode(child, idGenerator)) }
      : {}),
  };
}
