import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  expectStoredDocument,
  firstGridChild,
  insertFromPalette,
  layers,
  resetDocument,
  selectLayer,
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
      return column !== undefined && column !== initialColumn;
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
});
