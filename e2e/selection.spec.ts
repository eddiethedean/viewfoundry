import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  canvas,
  expectInspectorShowsType,
  insertIntoSelectedContainer,
  inspector,
  layers,
  resetDocument,
  selectCanvasNode,
  selectLayer,
  setEditSubMode,
  styleInspector,
} from './helpers.js';

test.describe('selection', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('selects a node by clicking on the canvas', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectCanvasNode(page, 'Button');
    await expectInspectorShowsType(inspector(page), 'Button');
  });

  test('selects Grid from the layers panel', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Grid\b/);
    await expectInspectorShowsType(inspector(page), 'Grid');
  });

  test('clears selection when clicking empty canvas area', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await page.getByTestId('vf-canvas-surface').click({ position: { x: 8, y: 8 } });
    await expect(inspector(page).getByText('Select a node to edit its properties')).toBeVisible();
  });

  test('clears selection with Escape key', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await page.keyboard.press('Escape');
    await expect(inspector(page).getByText('Select a node to edit its properties')).toBeVisible();
  });

  test('highlights selected node on canvas', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expect(
      canvas(page).locator('.vf-node-wrapper[data-component-type="Button"].vf-node-selected'),
    ).toBeVisible();
  });

  test('switches selection between sibling nodes', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expectInspectorShowsType(inspector(page), 'Button');
    await selectLayer(page, /^Grid\b/);
    await expectInspectorShowsType(inspector(page), 'Grid');
  });

  test('selects nested child independently of parent', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Text');
    await selectLayer(page, /^Text\b/);
    await expectInspectorShowsType(inspector(page), 'Text');
    await selectLayer(page, /^Card\b/);
    await expectInspectorShowsType(inspector(page), 'Card');
  });

  test('selects nested child from canvas click', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Heading');
    await selectCanvasNode(page, 'Heading');
    await expectInspectorShowsType(inspector(page), 'Heading');
  });

  test('preserves selection when switching to Style sub-mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await expect(styleInspector(page).locator('.vf-inspector-meta')).toContainText('Button');
  });

  test('preserves selection when switching back to Component sub-mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await setEditSubMode(page, 'Component');
    await expectInspectorShowsType(inspector(page), 'Button');
  });

  test('shows layer button as selected in layers panel', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveClass(
      /vf-layer-item-selected/,
    );
  });

  test('updates layers selection when selecting from canvas', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectCanvasNode(page, 'Button');
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveClass(
      /vf-layer-item-selected/,
    );
  });
});
