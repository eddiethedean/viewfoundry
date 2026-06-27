import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  expectInspectorShowsType,
  expectStoredDocument,
  firstGridChild,
  insertFromPalette,
  inspector,
  layers,
  resetDocument,
  selectLayer,
  setShowGrid,
  toolbar,
} from './helpers.js';

test.describe('grid layout', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('shows grid placement badge in the layers panel', async ({ page }) => {
    await bootstrapGridWithButton(page);

    const buttonLayer = layers(page).getByRole('button', { name: /^Button\b/ });
    await expect(buttonLayer).toContainText(/r\d+c\d+/);
  });

  test('nudges grid placement with arrow keys', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /Button/);

    const initialColumn = await page.evaluate(() => {
      const raw = localStorage.getItem('viewfoundry-basic-react-document');
      if (!raw) return null;
      const doc = JSON.parse(raw);
      return doc.root.children?.[0]?.children?.[0]?.layout?.grid?.column ?? null;
    });

    await page.keyboard.press('ArrowRight');

    await expectStoredDocument(page, (doc) => {
      const button = firstGridChild(doc);
      const column = button?.layout?.grid?.column;
      return column === (initialColumn ?? 1) + 1;
    });
  });

  test('exports grid placement as inline styles in TSX', async ({ page }) => {
    await bootstrapGridWithButton(page);

    await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();

    const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
    const code = await drawer.locator('pre').textContent();

    expect(code).toMatch(/gridColumn|gridRow/);
  });

  test('inserts Grid from palette with layout metadata', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Heading');

    await expect(page.locator('.demo-grid')).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Heading\b/ })).toBeVisible();

    await expectStoredDocument(page, (doc) => {
      const heading = doc.root.children?.[0]?.children?.[0];
      return heading?.type === 'Heading' && heading.layout?.grid !== undefined;
    });
  });

  test('orders layers by grid reading order after duplicate', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();

    const layerLabels = await layers(page)
      .getByRole('button', { name: /^Button\b/ })
      .allTextContents();
    expect(layerLabels).toHaveLength(2);
    expect(layerLabels[0]).toMatch(/r\d+c\d+/);
    expect(layerLabels[1]).toMatch(/r\d+c\d+/);
  });

  test('exports nested grid placement on grid container without wrapper div', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Grid');

    await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();
    const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
    const code = await drawer.locator('pre').textContent();
    expect(code).toMatch(/<Grid[^>]*style=\{\{[^}]*gridColumn/);
  });

  test('shows visible grid cells when Show Grid is enabled', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setShowGrid(page, true);
    await expect(page.locator('.vf-grid-drop-layer--visible')).toBeVisible();
    await expect(page.locator('.vf-grid-cell-drop--visible').first()).toBeVisible();
  });

  test('selects a node by clicking a grid cell', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setShowGrid(page, true);
    await page.locator('[data-grid-row="1"][data-grid-column="1"]').click();
    await expectInspectorShowsType(inspector(page), 'Button');
    await expect(page.locator('[data-grid-row="1"][data-grid-column="1"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('hides Show Grid toggle in Live mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setShowGrid(page, true);
    await toolbar(page).getByRole('button', { name: 'Live', exact: true }).click();
    await expect(toolbar(page).getByRole('button', { name: 'Show Grid' })).toBeHidden();
  });
});
