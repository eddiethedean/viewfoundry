import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { isGridContainer, sortChildrenByGridOrder } from '@viewfoundry/core';
import { useViewFoundryContext } from './context.js';
import {
  getChildPlacementStyle,
  getGridContainerStyle,
  getGridPlacementClass,
} from './grid-styles.js';
import { mergeStyles, resolveStyleMap } from './style-utils.js';

export type MissingComponentFallbackProps = {
  type: string;
  nodeId: string;
};

export function MissingComponentFallback({ type, nodeId }: MissingComponentFallbackProps) {
  return (
    <div className="vf-missing-component" data-node-id={nodeId} data-component-type={type}>
      Missing component: <strong>{type}</strong>
    </div>
  );
}

export function resolveComponent(
  type: string,
  registry: ReturnType<typeof useViewFoundryContext>['registry'],
): ComponentType<Record<string, unknown>> | null {
  const def = registry.get(type);
  if (!def?.component) return null;
  return def.component as ComponentType<Record<string, unknown>>;
}

export type ViewNodeRendererProps = {
  node: ViewNode;
  parent?: ViewNode | null;
  renderChildren?: boolean;
};

function renderChildNodes(node: ViewNode, renderChildren: boolean): ReactNode {
  if (!renderChildren || !node.children || node.children.length === 0) {
    return undefined;
  }
  const children = isGridContainer(node.type)
    ? sortChildrenByGridOrder(node.children)
    : node.children;
  return children.map((child) => <ViewNodeRenderer key={child.id} node={child} parent={node} />);
}

function wrapPreviewPlacement(
  content: ReactNode,
  placementStyle: CSSProperties | undefined,
  gridClass: string,
): ReactNode {
  if (!placementStyle || Object.keys(placementStyle).length === 0) {
    return content;
  }
  return (
    <div className={`vf-grid-placement${gridClass}`} style={placementStyle}>
      {content}
    </div>
  );
}

export function ViewNodeRenderer({
  node,
  parent = null,
  renderChildren = true,
}: ViewNodeRendererProps) {
  const {
    registry,
    mode,
    selection,
    styleTokens,
    onSelectNode,
    wrapEditNode,
    renderGridDropLayer,
  } = useViewFoundryContext();
  const Component = resolveComponent(node.type, registry);
  const isSelected = selection.selectedNodeIds.includes(node.id);
  const isEditMode = mode === 'edit';
  const placementStyle = getChildPlacementStyle(parent, node);
  const gridContainerStyle = getGridContainerStyle(node);
  const childElements = renderChildNodes(node, renderChildren);
  const hasGridPlacement = Boolean(placementStyle && Object.keys(placementStyle).length > 0);
  const placementOnEditShell = isEditMode && hasGridPlacement && Boolean(wrapEditNode);
  const needsPlacementWrapper =
    !isEditMode && hasGridPlacement && !isGridContainer(node.type) && node.type !== 'Root';

  const props = { ...(node.props ?? {}) } as Record<string, unknown>;
  if (typeof props.children === 'string' && !childElements) {
    delete props.children;
  }

  const nodeStyle = resolveStyleMap(node.style, styleTokens);

  const mergedStyle: CSSProperties = mergeStyles(
    (props.style as CSSProperties | undefined) ?? {},
    nodeStyle,
    isEditMode || needsPlacementWrapper ? {} : placementStyle,
    gridContainerStyle,
  );
  if (Object.keys(mergedStyle).length > 0) {
    props.style = mergedStyle;
  }

  const jsxChildren: ReactNode =
    childElements ?? (typeof node.props?.children === 'string' ? node.props.children : undefined);

  const gridClass = isGridContainer(node.type)
    ? ' vf-grid-container'
    : getGridPlacementClass(parent);

  if (!isEditMode) {
    if (node.type === 'Root') {
      return <>{childElements}</>;
    }
    if (!Component) {
      return wrapPreviewPlacement(
        <MissingComponentFallback type={node.type} nodeId={node.id} />,
        placementStyle,
        gridClass,
      );
    }
    return wrapPreviewPlacement(
      <Component {...props}>{jsxChildren}</Component>,
      needsPlacementWrapper ? placementStyle : undefined,
      gridClass,
    );
  }

  const editWrapper = (content: ReactNode, includeGridLayer = false) => {
    const element = (
      <>
        {content}
        {includeGridLayer && isEditMode && renderGridDropLayer?.(node)}
      </>
    );
    if (wrapEditNode) {
      return wrapEditNode(node, element, parent);
    }
    return element;
  };

  if (!Component) {
    if (node.type === 'Root') {
      return <div className="vf-root">{childElements}</div>;
    }
    return editWrapper(
      <div
        className={`vf-node-wrapper${gridClass}${isSelected ? ' vf-node-selected' : ''}`}
        style={placementOnEditShell ? undefined : placementStyle}
        data-node-id={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
      >
        <MissingComponentFallback type={node.type} nodeId={node.id} />
      </div>,
    );
  }

  if (node.type === 'Root') {
    return editWrapper(
      <div
        className={`vf-root${isSelected ? ' vf-node-selected' : ''}`}
        data-node-id={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
      >
        {childElements}
      </div>,
    );
  }

  const componentProps = { ...props };
  if (hasGridPlacement && componentProps.style) {
    const componentOnlyStyle = { ...((componentProps.style as CSSProperties | undefined) ?? {}) };
    for (const key of Object.keys(placementStyle ?? {})) {
      delete componentOnlyStyle[key as keyof CSSProperties];
    }
    if (Object.keys(componentOnlyStyle).length > 0) {
      componentProps.style = componentOnlyStyle;
    } else {
      delete componentProps.style;
    }
  }

  return editWrapper(
    <div
      className={`vf-node-wrapper${gridClass}${isSelected ? ' vf-node-selected' : ''}`}
      style={placementOnEditShell ? undefined : placementStyle}
      data-node-id={node.id}
      data-component-type={node.type}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
      }}
    >
      <Component {...componentProps}>{jsxChildren}</Component>
    </div>,
    isGridContainer(node.type),
  );
}
