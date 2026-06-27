import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  countLayers,
  insertFromPalette,
  insertIntoSelectedContainer,
  inspector,
  layers,
  removeSelectedNode,
  resetDocument,
  selectLayer,
  toolbar,
} from './helpers.js';

test.describe('layers panel', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('shows Root at the top of the tree', async ({ page }) => {
    await expect(layers(page).getByRole('button', { name: /^Root\b/ })).toBeVisible();
  });

  test('shows grid placement badge on placed nodes', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await expect(countLayers(page, /^Button\b/)).toContainText(/r1c1/);
  });

  test('updates layer badge after grid nudge', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await page.keyboard.press('ArrowRight');
    await expect(countLayers(page, /^Button\b/)).toContainText(/r1c2/);
  });

  test('reflects duplicate as a second layer entry', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await expect(countLayers(page, /^Button\b/)).toHaveCount(2);
  });

  test('removes layer entry after remove action', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await removeSelectedNode(page, 'Button');
    await expect(countLayers(page, /^Button\b/)).toHaveCount(0);
  });

  test('selects Grid from layers and shows inspector', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Grid\b/);
    await expect(inspector(page).locator('.vf-inspector-meta')).toContainText('Grid');
  });

  test('shows nested children under Card', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Heading');
    await expect(countLayers(page, /^Card\b/)).toBeVisible();
    await expect(countLayers(page, /^Heading\b/)).toBeVisible();
  });

  test('selects nested child independently of parent', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Text');
    await selectLayer(page, /^Text\b/);
    await expect(inspector(page).locator('.vf-inspector-meta')).toContainText('Text');
    await selectLayer(page, /^Card\b/);
    await expect(inspector(page).locator('.vf-inspector-meta')).toContainText('Card');
  });

  test('orders duplicate buttons by grid reading order', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    const labels = await countLayers(page, /^Button\b/).allTextContents();
    expect(labels[0]).toMatch(/r1c1/);
    expect(labels[1]).toMatch(/r1c2/);
  });

  test('shows Grid layer after bootstrap insert', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await expect(countLayers(page, /^Grid\b/)).toBeVisible();
    await expect(countLayers(page, /^Root\b/)).toBeVisible();
  });
});
