import type { ReactNode, MouseEvent } from 'react';
import type { SourceElementId } from '@viewfoundry/core';
import { formatSourceLoc, parseSourceLoc, useCodeFirstContext } from './code-first-context.js';

export type SourceBoundaryProps = {
  file: string;
  start: number;
  end: number;
  tagName: string;
  children: ReactNode;
  elementId?: SourceElementId;
};

export function SourceBoundary({
  file,
  start,
  end,
  tagName,
  children,
  elementId,
}: SourceBoundaryProps) {
  const { mode, selectedElementId, clickMode, onSelectElement } = useCodeFirstContext();
  const id = elementId ?? `${file}:${start}`;
  const loc = formatSourceLoc(file, start, end);
  const isSelected = selectedElementId === id;
  const isEdit = mode === 'edit';

  const handleClick = (e: MouseEvent) => {
    if (!isEdit) return;
    e.stopPropagation();
    if (clickMode === 'child-first') {
      onSelectElement(id);
      return;
    }
    if (selectedElementId === id) {
      onSelectElement(id);
    } else {
      onSelectElement(id);
    }
  };

  if (!isEdit) {
    return <>{children}</>;
  }

  return (
    <div
      className={`vf-source-boundary${isSelected ? ' vf-source-boundary--selected' : ''}`}
      data-vf-loc={loc}
      data-vf-tag={tagName}
      data-vf-element-id={id}
      onClick={handleClick}
      role="group"
      aria-label={tagName}
    >
      {children}
    </div>
  );
}

export function sourceLocFromTarget(target: EventTarget | null): SourceElementId | null {
  if (!(target instanceof HTMLElement)) return null;
  const el = target.closest('[data-vf-element-id]') as HTMLElement | null;
  return el?.dataset.vfElementId ?? null;
}

export function sourceLocFromAttribute(el: HTMLElement): SourceElementId | null {
  const parsed = parseSourceLoc(el.dataset.vfLoc);
  if (!parsed) return el.dataset.vfElementId ?? null;
  return formatSourceLoc(parsed.file, parsed.start, parsed.end);
}
