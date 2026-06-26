import type { ComponentType, ReactNode } from 'react';
import type { ViewNode } from '@viewfoundry/core';
import { useViewFoundryContext } from './context.js';

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
  renderChildren?: boolean;
};

export function ViewNodeRenderer({ node, renderChildren = true }: ViewNodeRendererProps) {
  const { registry, mode, selection, onSelectNode } = useViewFoundryContext();
  const Component = resolveComponent(node.type, registry);
  const isSelected = selection.selectedNodeIds.includes(node.id);
  const isEditMode = mode === 'edit';

  const childElements =
    renderChildren && node.children && node.children.length > 0
      ? node.children.map((child) => <ViewNodeRenderer key={child.id} node={child} />)
      : undefined;

  const props = { ...(node.props ?? {}) } as Record<string, unknown>;

  if (typeof props.children === 'string' && !childElements) {
    delete props.children;
  }

  const jsxChildren: ReactNode =
    childElements ?? (typeof node.props?.children === 'string' ? node.props.children : undefined);

  if (!isEditMode) {
    if (node.type === 'Root') {
      return <>{childElements}</>;
    }
    if (!Component) {
      return <MissingComponentFallback type={node.type} nodeId={node.id} />;
    }
    return <Component {...props}>{jsxChildren}</Component>;
  }

  if (!Component) {
    if (node.type === 'Root') {
      return <div className="vf-root">{childElements}</div>;
    }
    return (
      <div
        className={`vf-node-wrapper${isSelected ? ' vf-node-selected' : ''}`}
        data-node-id={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
      >
        <MissingComponentFallback type={node.type} nodeId={node.id} />
      </div>
    );
  }

  if (node.type === 'Root') {
    return (
      <div
        className={`vf-root${isSelected ? ' vf-node-selected' : ''}`}
        data-node-id={node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectNode?.(node.id);
        }}
      >
        {childElements}
      </div>
    );
  }

  return (
    <div
      className={`vf-node-wrapper${isSelected ? ' vf-node-selected' : ''}`}
      data-node-id={node.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(node.id);
      }}
    >
      <Component {...props}>{jsxChildren}</Component>
    </div>
  );
}
