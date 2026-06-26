import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createDocument, createNode, findNode } from '@viewfoundry/core';
import { ViewFoundryEditor } from '../src/index.js';
import { createDemoRegistry } from './test/fixtures.js';

const registry = createDemoRegistry();

function renderEditor(
  document = createDocument(),
  options?: {
    onChange?: (doc: ReturnType<typeof createDocument>) => void;
    onStudioModeChange?: (mode: 'edit' | 'live') => void;
    defaultStudioMode?: 'edit' | 'live';
  },
) {
  return render(
    <ViewFoundryEditor
      registry={registry}
      document={document}
      onChange={options?.onChange ?? (() => {})}
      onStudioModeChange={options?.onStudioModeChange}
      defaultStudioMode={options?.defaultStudioMode}
    />,
  );
}

function latestDocument(onChange: ReturnType<typeof vi.fn>) {
  const lastCall = onChange.mock.calls.at(-1);
  if (!lastCall) throw new Error('onChange was not called');
  return lastCall[0] as ReturnType<typeof createDocument>;
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

  it('runs component interactions in Live mode', async () => {
    const user = userEvent.setup();
    const doc = createDocument();
    doc.root.children = [createNode('CounterButton', {}, [], 'counter1')];

    const { container } = renderEditor(doc);
    await user.click(screen.getByRole('button', { name: 'Live' }));

    expect(screen.queryByText('Components')).toBeNull();
    expect(container.querySelector('.vf-node-wrapper')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Count 0/ }));
    expect(screen.getByRole('button', { name: /Count 1/ })).toBeInTheDocument();
  });

  it('inserts a component from the palette', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    const doc = latestDocument(onChange);
    expect(doc.root.children).toHaveLength(1);
    expect(doc.root.children?.[0].type).toBe('Button');
  });

  it('shows inspector details after layer selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    const doc = latestDocument(onChange);
    const nodeId = doc.root.children?.[0].id;
    if (!nodeId) throw new Error('node missing');

    const layers = screen.getByText('Layers').closest('.vf-layers');
    if (!layers) throw new Error('layers missing');
    await user.click(within(layers).getByRole('button', { name: new RegExp(nodeId) }));

    const inspector = screen.getByText('Inspector').closest('.vf-inspector');
    if (!inspector) throw new Error('inspector missing');
    expect(within(inspector).getByRole('textbox', { name: 'Text' })).toHaveValue('Click me');
    expect(within(inspector).getByText(nodeId)).toBeInTheDocument();
  });

  it('updates props from the inspector', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    const doc = latestDocument(onChange);
    const nodeId = doc.root.children?.[0].id;
    if (!nodeId) throw new Error('node missing');

    const layers = screen.getByText('Layers').closest('.vf-layers');
    if (!layers) throw new Error('layers missing');
    await user.click(within(layers).getByRole('button', { name: new RegExp(nodeId) }));

    const textInput = screen.getByRole('textbox', { name: 'Text' });
    await user.clear(textInput);
    await user.type(textInput, 'Save');

    const updated = onChange.mock.calls.some(([nextDoc]) => {
      const node = findNode(nextDoc.root, nodeId);
      return node?.props?.children === 'Save';
    });
    expect(updated).toBe(true);
  });

  it('undoes and redoes palette insert from the toolbar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const undoButton = screen.getByRole('button', { name: 'Undo' });
    expect(undoButton).toBeDisabled();

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));
    expect(latestDocument(onChange).root.children).toHaveLength(1);

    expect(undoButton).toBeEnabled();
    await user.click(undoButton);
    expect(latestDocument(onChange).root.children).toHaveLength(0);

    const redoButton = screen.getByRole('button', { name: 'Redo' });
    await user.click(redoButton);
    expect(latestDocument(onChange).root.children).toHaveLength(1);
  });

  it('deletes selected node from the toolbar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    const doc = latestDocument(onChange);
    const nodeId = doc.root.children?.[0].id;
    if (!nodeId) throw new Error('node missing');

    const layers = screen.getByText('Layers').closest('.vf-layers');
    if (!layers) throw new Error('layers missing');
    await user.click(within(layers).getByRole('button', { name: new RegExp(nodeId) }));

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(latestDocument(onChange).root.children).toHaveLength(0);
  });

  it('duplicates selected node from the toolbar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    const doc = latestDocument(onChange);
    const nodeId = doc.root.children?.[0].id;
    if (!nodeId) throw new Error('node missing');

    const layers = screen.getByText('Layers').closest('.vf-layers');
    if (!layers) throw new Error('layers missing');
    await user.click(within(layers).getByRole('button', { name: new RegExp(nodeId) }));

    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    const children = latestDocument(onChange).root.children ?? [];
    expect(children).toHaveLength(2);
    expect(children[0].id).not.toBe(children[1].id);
  });

  it('preserves document content when switching to Live mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    await user.click(screen.getByRole('button', { name: 'Live' }));
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onStudioModeChange when toggling modes', async () => {
    const user = userEvent.setup();
    const onStudioModeChange = vi.fn();
    renderEditor(createDocument(), { onStudioModeChange });

    await user.click(screen.getByRole('button', { name: 'Live' }));
    expect(onStudioModeChange).toHaveBeenCalledWith('live');
  });

  it('undoes insert via keyboard shortcut', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));
    expect(latestDocument(onChange).root.children).toHaveLength(1);

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(latestDocument(onChange).root.children).toHaveLength(0);
  });

  it('calls the latest onChange callback after rerender', async () => {
    const user = userEvent.setup();
    const onChange1 = vi.fn();
    const doc = createDocument();
    const { rerender } = render(
      <ViewFoundryEditor registry={registry} document={doc} onChange={onChange1} />,
    );

    const onChange2 = vi.fn();
    rerender(<ViewFoundryEditor registry={registry} document={doc} onChange={onChange2} />);

    onChange1.mockClear();
    onChange2.mockClear();

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Button' }));

    expect(onChange2).toHaveBeenCalled();
    expect(onChange1).not.toHaveBeenCalled();
  });

  it('inserts dragged components into the selected container', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderEditor(createDocument(), { onChange });

    const palette = screen.getByText('Components').closest('.vf-palette');
    if (!palette) throw new Error('palette missing');
    await user.click(within(palette).getByRole('button', { name: 'Card' }));

    const docWithCard = latestDocument(onChange);
    const cardId = docWithCard.root.children?.[0].id;
    if (!cardId) throw new Error('card missing');

    const layers = screen.getByText('Layers').closest('.vf-layers');
    if (!layers) throw new Error('layers missing');
    await user.click(within(layers).getByRole('button', { name: new RegExp(cardId) }));

    const buttonItem = within(palette).getByRole('button', { name: 'Button' });
    const dataTransfer = {
      data: {} as Record<string, string>,
      effectAllowed: 'copy',
      dropEffect: 'copy',
      setData(type: string, value: string) {
        this.data[type] = value;
      },
      getData(type: string) {
        return this.data[type] ?? '';
      },
    };

    fireEvent.dragStart(buttonItem, { dataTransfer });
    const canvas = screen.getByText('Canvas').closest('.vf-canvas');
    if (!canvas) throw new Error('canvas missing');
    fireEvent.dragOver(canvas, { dataTransfer });
    fireEvent.drop(canvas, { dataTransfer });

    const finalDoc = latestDocument(onChange);
    const card = findNode(finalDoc.root, cardId);
    expect(card?.children).toHaveLength(1);
    expect(card?.children?.[0].type).toBe('Button');
    expect(finalDoc.root.children).toHaveLength(1);
  });
});
