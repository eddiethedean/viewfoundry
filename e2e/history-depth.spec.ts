import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  expectStoredDocument,
  firstGridChild,
  insertFromPalette,
  inspector,
  layers,
  removeSelectedNode,
  resetDocument,
  selectLayer,
  setEditSubMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('undo/redo history', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('tracks insert, delete, and restore through undo chain', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await removeSelectedNode(page, 'Button');
    await expect(demoButton(page, 'Click me')).toBeHidden();

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('undoes duplicate and restores single button', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(1);
  });

  test('undoes prop edit and restores previous label', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('textbox', { name: 'Text' }).fill('Changed');
    await expect(demoButton(page, 'Changed')).toBeVisible();

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('undoes style edit and clears margin', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await styleInspector(page).getByLabel('Margin').fill('14');
    await styleInspector(page).getByLabel('Margin').blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 14);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === undefined);
  });

  test('redoes after undo restores duplicate', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await toolbar(page).getByRole('button', { name: 'Redo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);
  });

  test('handles three-level undo after sequential inserts', async ({ page }) => {
    await insertFromPalette(page, 'Button');
    await insertFromPalette(page, 'Heading');
    await insertFromPalette(page, 'Text');

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Text\b/ })).toHaveCount(0);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Heading\b/ })).toHaveCount(0);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(0);
  });

  test('disables Redo after a new edit following undo', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(toolbar(page).getByRole('button', { name: 'Redo' })).toBeEnabled();

    await insertFromPalette(page, 'Heading');
    await expect(toolbar(page).getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  test('undoes grid nudge and restores column', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    const before = await page.evaluate(() => {
      const raw = localStorage.getItem('viewfoundry-basic-react-document');
      if (!raw) return null;
      const doc = JSON.parse(raw);
      return doc.root.children?.[0]?.children?.[0]?.layout?.grid?.column ?? null;
    });

    await page.keyboard.press('ArrowRight');
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();

    await expectStoredDocument(page, (doc) => {
      const column = firstGridChild(doc)?.layout?.grid?.column;
      return column === before;
    });
  });

  test('maintains coherent document after undo-redo-undo cycle', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await toolbar(page).getByRole('button', { name: 'Redo' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();

    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(1);
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toBeVisible();
  });
});
