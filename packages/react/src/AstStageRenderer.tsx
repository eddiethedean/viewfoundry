import { createElement, type CSSProperties, type ReactNode } from 'react';
import type { ComponentRegistry } from '@viewfoundry/core';
import type { ParsedJsxElement, ParsedSourceFile } from '@viewfoundry/sync';
import { extractJsxProps } from '@viewfoundry/sync';
import { MissingComponentFallback } from './ViewNodeRenderer.js';
import { SourceBoundary } from './SourceBoundary.js';

const LAYOUT_CONTAINERS = new Set(['Stack', 'Grid', 'Row']);

export type AstStageDndRenderProps = {
  wrapElement: (params: { elementId: string; tagName: string; children: ReactNode }) => ReactNode;
  renderDropSlot: (params: { parentId: string; index: number }) => ReactNode;
};

function extractTextChild(content: string, element: ParsedJsxElement): string | undefined {
  if (element.isSelfClosing || element.childIds.length > 0) return undefined;
  const slice = content.slice(element.location.start, element.location.end);
  const openEnd = slice.indexOf('>');
  const closeStart = slice.lastIndexOf('</');
  if (openEnd < 0 || closeStart <= openEnd) return undefined;
  const text = slice.slice(openEnd + 1, closeStart).trim();
  return text || undefined;
}

function renderChildren(
  parsed: ParsedSourceFile,
  element: ParsedJsxElement,
  registry: ComponentRegistry,
  mode: 'preview' | 'edit',
  dnd: AstStageDndRenderProps | undefined,
): ReactNode {
  const textChild = extractTextChild(parsed.content, element);
  if (element.childIds.length === 0) return textChild;

  const useDropSlots = mode === 'edit' && dnd && LAYOUT_CONTAINERS.has(element.tagName);

  if (!useDropSlots) {
    const childNodes = element.childIds
      .map((id) => {
        const child = parsed.elements.get(id);
        return child ? renderElement(parsed, child, registry, mode, dnd) : null;
      })
      .filter(Boolean);
    return childNodes.length > 0 ? childNodes : textChild;
  }

  const interleaved: ReactNode[] = [];
  for (let i = 0; i <= element.childIds.length; i++) {
    interleaved.push(dnd.renderDropSlot({ parentId: element.id, index: i }));
    if (i < element.childIds.length) {
      const child = parsed.elements.get(element.childIds[i]);
      if (child) {
        interleaved.push(renderElement(parsed, child, registry, mode, dnd));
      }
    }
  }
  return interleaved;
}

function renderElement(
  parsed: ParsedSourceFile,
  element: ParsedJsxElement,
  registry: ComponentRegistry,
  mode: 'preview' | 'edit',
  dnd: AstStageDndRenderProps | undefined,
): ReactNode {
  const def = registry.get(element.tagName);
  const props = extractJsxProps(parsed.content, element);
  const children = renderChildren(parsed, element, registry, mode, dnd);

  let rendered: ReactNode;
  if (!def?.component) {
    rendered = <MissingComponentFallback type={element.tagName} nodeId={element.id} />;
  } else {
    rendered = createElement(
      def.component as React.ComponentType<Record<string, unknown>>,
      props,
      children,
    );
  }

  if (mode !== 'edit') return rendered;

  const wrapped = dnd
    ? dnd.wrapElement({ elementId: element.id, tagName: element.tagName, children: rendered })
    : rendered;

  return (
    <SourceBoundary
      key={element.id}
      file={element.location.file}
      start={element.location.start}
      end={element.location.end}
      tagName={element.tagName}
      elementId={element.id}
      parentId={element.parentId}
    >
      {wrapped}
    </SourceBoundary>
  );
}

export type AstStageRendererProps = {
  parsed: ParsedSourceFile;
  registry: ComponentRegistry;
  mode?: 'preview' | 'edit';
  className?: string;
  viewport?: { width: number; height: number };
  background?: CSSProperties['background'];
  dnd?: AstStageDndRenderProps;
};

export function AstStageRenderer({
  parsed,
  registry,
  mode = 'edit',
  className,
  viewport,
  background,
  dnd,
}: AstStageRendererProps) {
  const roots = parsed.rootIds
    .map((id) => parsed.elements.get(id))
    .filter((el): el is ParsedJsxElement => Boolean(el));

  return (
    <div
      className={`vf-board-stage${className ? ` ${className}` : ''}`}
      data-vf-stage
      data-vf-mode={mode}
      style={{
        width: viewport?.width,
        minHeight: viewport?.height,
        maxWidth: '100%',
        margin: '0 auto',
        background: background ?? 'transparent',
      }}
    >
      <div className="vf-board-stage-inner">
        {roots.map((el) => (
          <span key={el.id}>{renderElement(parsed, el, registry, mode, dnd)}</span>
        ))}
      </div>
    </div>
  );
}
