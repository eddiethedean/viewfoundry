import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createDocument, createNode, createRegistry } from '@viewfoundry/core';
import { ViewFoundryEditor } from '../src/index.js';

function Button({ children }: { children?: string }) {
  return <button type="button">{children}</button>;
}

const registry = createRegistry([
  {
    type: 'Button',
    label: 'Button',
    category: 'Controls',
    component: Button,
    acceptsChildren: true,
  },
]);

function renderEditor(document = createDocument()) {
  return render(
    <ViewFoundryEditor registry={registry} document={document} onChange={() => {}} />,
  );
}

describe('ViewFoundryEditor', () => {
  afterEach(() => cleanup());

  it('opens in Edit mode by default', () => {
    renderEditor();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides editor chrome in Live mode', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole('button', { name: 'Live' }));

    expect(screen.queryByText('Components')).toBeNull();
    expect(screen.queryByText('Inspector')).toBeNull();
    expect(screen.getByRole('button', { name: 'Live' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores editor chrome when returning to Edit mode', async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole('button', { name: 'Live' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('allows interactive components in Live mode', async () => {
    const user = userEvent.setup();
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Click me' }, [], 'btn1')];

    renderEditor(doc);
    await user.click(screen.getByRole('button', { name: 'Live' }));

    const renderedButton = screen.getByRole('button', { name: 'Click me' });
    await user.click(renderedButton);
    expect(renderedButton).toBeInTheDocument();
  });
});
