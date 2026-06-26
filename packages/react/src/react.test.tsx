import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createDocument, createNode, createRegistry } from '@viewfoundry/core';
import { ViewFoundryProvider, ViewRenderer } from '../src/index.js';

function Button({ children, variant }: { children?: string; variant?: string }) {
  return <button data-variant={variant}>{children}</button>;
}

describe('ViewRenderer', () => {
  afterEach(() => cleanup());
  const registry = createRegistry([
    {
      type: 'Button',
      component: Button,
      acceptsChildren: true,
    },
  ]);

  it('renders a document tree', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Click me', variant: 'primary' }, [], 'b1')];

    render(
      <ViewFoundryProvider document={doc} registry={registry}>
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Click me');
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');
  });

  it('renders nested children', () => {
    const registryWithCard = createRegistry([
      { type: 'Card', component: ({ children }: { children?: React.ReactNode }) => <div data-testid="card">{children}</div>, acceptsChildren: true },
      { type: 'Button', component: Button, acceptsChildren: true },
    ]);

    const doc = createDocument();
    const card = createNode('Card', {}, [createNode('Button', { children: 'Nested' }, [], 'btn')], 'card');
    doc.root.children = [card];

    render(
      <ViewFoundryProvider document={doc} registry={registryWithCard}>
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Nested');
  });

  it('renders missing component fallback', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown', {}, [], 'u1')];

    render(
      <ViewFoundryProvider document={doc} registry={registry}>
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    expect(screen.getByText(/Missing component/)).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
