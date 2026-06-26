import type { ReactNode, CSSProperties } from 'react';

type ButtonProps = {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

export function Button({ children, variant = 'primary', disabled }: ButtonProps) {
  return (
    <button className={`demo-button demo-button--${variant}`} disabled={disabled}>
      {children}
    </button>
  );
}

type CardProps = {
  children?: ReactNode;
  title?: string;
};

export function Card({ children, title }: CardProps) {
  return (
    <div className="demo-card">
      {title && <h3 className="demo-heading demo-heading--h3">{title}</h3>}
      {children}
    </div>
  );
}

type StackProps = {
  children?: ReactNode;
  direction?: 'vertical' | 'horizontal';
  gap?: number;
  align?: CSSProperties['alignItems'];
};

export function Stack({ children, direction = 'vertical', gap = 12, align }: StackProps) {
  return (
    <div className={`demo-stack demo-stack--${direction}`} style={{ gap, alignItems: align }}>
      {children}
    </div>
  );
}

type HeadingProps = {
  children?: ReactNode;
  level?: 'h1' | 'h2' | 'h3';
};

export function Heading({ children, level = 'h2' }: HeadingProps) {
  const Tag = level;
  return <Tag className={`demo-heading demo-heading--${level}`}>{children}</Tag>;
}

type TextProps = {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Text({ children, size = 'md' }: TextProps) {
  return <p className={`demo-text demo-text--${size}`}>{children}</p>;
}

type GridProps = {
  children?: ReactNode;
  columns?: number;
  rows?: number;
  gap?: number;
  minRowHeight?: number | string;
  style?: CSSProperties;
};

export function Grid({ children, columns = 4, rows, gap = 8, minRowHeight, style }: GridProps) {
  return (
    <div
      className="demo-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: rows ? `repeat(${rows}, minmax(0, auto))` : undefined,
        gap,
        minHeight: minRowHeight,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type RowProps = {
  children?: ReactNode;
  columns?: number;
  gap?: number;
  style?: CSSProperties;
};

export function Row({ children, columns = 4, gap = 8, style }: RowProps) {
  return (
    <div
      className="demo-row"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: 'minmax(0, auto)',
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
