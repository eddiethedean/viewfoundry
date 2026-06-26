import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createDocument, createNode, createRegistry, createSelection, selectNode } from '@viewfoundry/core';
import {
  ViewFoundryProvider,
  ViewRenderer,
  useViewDocument,
  useViewRegistry,
  useViewSelection,
} from '../src/index.js';

function Button({ children, variant }: { children?: string; variant?: string }) {
  return <button data-variant={variant}>{children}</button>;
}

function HookProbe() {
  const document = useViewDocument();
  const registry = useViewRegistry();
  const selection = useViewSelection();
  return (
    <div
      data-testid="probe"
      data-root-id={document.root.id}
      data-has-button={String(registry.has('Button'))}
      data-selection={selection.selectedNodeIds.join(',')}
    />
  );
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

  it('renders preview mode without editor wrappers', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Live click' }, [], 'b1')];

    const { container } = render(
      <ViewFoundryProvider document={doc} registry={registry} mode="preview">
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('Live click');
    expect(container.querySelector('.vf-node-wrapper')).toBeNull();
  });

  it('renders edit mode with node wrappers', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Edit me' }, [], 'b1')];

    const { container } = render(
      <ViewFoundryProvider document={doc} registry={registry} mode="edit">
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    const wrapper = container.querySelector('.vf-node-wrapper[data-node-id="b1"]');
    expect(wrapper).not.toBeNull();
  });

  it('calls onSelectNode when a node is clicked in edit mode', async () => {
    const user = userEvent.setup();
    const onSelectNode = vi.fn();
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];

    render(
      <ViewFoundryProvider
        document={doc}
        registry={registry}
        mode="edit"
        onSelectNode={onSelectNode}
      >
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Hi' }));
    expect(onSelectNode).toHaveBeenCalledWith('b1');
  });

  it('applies selected styling in edit mode', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Selected' }, [], 'b1')];

    const { container } = render(
      <ViewFoundryProvider
        document={doc}
        registry={registry}
        mode="edit"
        selection={selectNode(createSelection(), 'b1')}
      >
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    expect(container.querySelector('.vf-node-selected[data-node-id="b1"]')).not.toBeNull();
  });

  it('wraps missing components in edit mode', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown', {}, [], 'u1')];

    const { container } = render(
      <ViewFoundryProvider document={doc} registry={registry} mode="edit">
        <ViewRenderer />
      </ViewFoundryProvider>,
    );

    const wrapper = container.querySelector('.vf-node-wrapper[data-node-id="u1"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.textContent).toContain('Missing component');
  });
});

describe('ViewFoundryProvider hooks', () => {
  afterEach(() => cleanup());

  it('exposes document, registry, and selection via hooks', () => {
    const doc = createDocument();
    const registry = createRegistry([
      { type: 'Button', component: Button, acceptsChildren: true },
    ]);
    const selection = selectNode(createSelection(), 'root');

    render(
      <ViewFoundryProvider document={doc} registry={registry} selection={selection}>
        <HookProbe />
      </ViewFoundryProvider>,
    );

    const probe = screen.getByTestId('probe');
    expect(probe).toHaveAttribute('data-root-id', 'root');
    expect(probe).toHaveAttribute('data-has-button', 'true');
    expect(probe).toHaveAttribute('data-selection', 'root');
  });

  it('throws when hooks are used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<HookProbe />)).toThrow(/ViewFoundryProvider/);
    consoleError.mockRestore();
  });
});
