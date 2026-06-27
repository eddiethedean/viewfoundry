import { createElement, type ReactNode } from 'react';
import type { ComponentRegistry } from '@viewfoundry/core';
import type { ParsedJsxElement, ParsedSourceFile } from '@viewfoundry/sync';
import { extractJsxProps } from '@viewfoundry/sync';
import { SourceBoundary } from './SourceBoundary.js';

function extractTextChild(content: string, element: ParsedJsxElement): string | undefined {
  if (element.isSelfClosing || element.childIds.length > 0) return undefined;
  const slice = content.slice(element.location.start, element.location.end);
  const openEnd = slice.indexOf('>');
  const closeStart = slice.lastIndexOf('</');
  if (openEnd < 0 || closeStart <= openEnd) return undefined;
  const text = slice.slice(openEnd + 1, closeStart).trim();
  return text || undefined;
}

function renderElement(
  parsed: ParsedSourceFile,
  element: ParsedJsxElement,
  registry: ComponentRegistry,
  mode: 'preview' | 'edit',
): ReactNode {
  const def = registry.get(element.tagName);
  const Component = def?.component ?? element.tagName.toLowerCase();
  const props = extractJsxProps(parsed.content, element);
  const textChild = extractTextChild(parsed.content, element);

  const childNodes: ReactNode[] = element.childIds
    .map((id) => {
      const child = parsed.elements.get(id);
      return child ? renderElement(parsed, child, registry, mode) : null;
    })
    .filter(Boolean);

  const children = childNodes.length > 0 ? childNodes : textChild;

  const rendered = createElement(
    Component as React.ComponentType<Record<string, unknown>>,
    props,
    children,
  );

  if (mode !== 'edit') return rendered;

  return (
    <SourceBoundary
      key={element.id}
      file={element.location.file}
      start={element.location.start}
      end={element.location.end}
      tagName={element.tagName}
      elementId={element.id}
    >
      {rendered}
    </SourceBoundary>
  );
}

export type AstStageRendererProps = {
  parsed: ParsedSourceFile;
  registry: ComponentRegistry;
  mode?: 'preview' | 'edit';
  className?: string;
  viewport?: { width: number; height: number };
  background?: string;
};

export function AstStageRenderer({
  parsed,
  registry,
  mode = 'edit',
  className,
  viewport,
  background,
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
          <span key={el.id}>{renderElement(parsed, el, registry, mode)}</span>
        ))}
      </div>
    </div>
  );
}
