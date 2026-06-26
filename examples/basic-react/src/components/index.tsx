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
    <div
      className={`demo-stack demo-stack--${direction}`}
      style={{ gap, alignItems: align }}
    >
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
