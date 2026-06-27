import type { ComponentType, CSSProperties, ReactNode } from 'react';

export type BoardViewport = {
  width: number;
  height: number;
};

export type BoardDefinition<TProps = Record<string, unknown>> = {
  id: string;
  name: string;
  component: ComponentType<TProps>;
  props: TProps;
  viewport: BoardViewport;
  sourceFile?: string;
  background?: CSSProperties['background'];
  wrapper?: ComponentType<{ children: ReactNode }>;
  tags?: string[];
};

export type CreateBoardOptions<TProps = Record<string, unknown>> = {
  name: string;
  component: ComponentType<TProps>;
  props: TProps;
  viewport?: Partial<BoardViewport>;
  sourceFile?: string;
  background?: CSSProperties['background'];
  wrapper?: ComponentType<{ children: ReactNode }>;
  tags?: string[];
};

const DEFAULT_VIEWPORT: BoardViewport = { width: 360, height: 480 };

export function createBoard<TProps = Record<string, unknown>>(
  options: CreateBoardOptions<TProps>,
): BoardDefinition<TProps> {
  const viewport = { ...DEFAULT_VIEWPORT, ...options.viewport };
  return {
    id: options.name,
    name: options.name,
    component: options.component,
    props: options.props,
    viewport,
    sourceFile: options.sourceFile,
    background: options.background,
    wrapper: options.wrapper,
    tags: options.tags,
  };
}

export type BoardCatalogEntry = {
  id: string;
  name: string;
  moduleId: string;
  sourceFile?: string;
};
