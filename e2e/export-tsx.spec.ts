import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  closeExportDrawer,
  expectStoredDocument,
  exportTsx,
  firstGridChild,
  insertFromPalette,
  insertIntoSelectedContainer,
  resetDocument,
  selectLayer,
  setEditSubMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('TSX export', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('exports empty document shell', async ({ page }) => {
    const drawer = await exportTsx(page);
    await expect(drawer.locator('pre')).toContainText('export function DemoView');
    await closeExportDrawer(page);
  });

  test('exports component imports for used types', async ({ page }) => {
    await bootstrapGridWithButton(page);
    const drawer = await exportTsx(page);
    const code = await drawer.locator('pre').textContent();
    expect(code).toContain('import');
    expect(code).toContain('Button');
    await closeExportDrawer(page);
  });

  test('exports edited button label', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await page.locator('.vf-inspector').getByRole('textbox', { name: 'Text' }).fill('Export me');
    const drawer = await exportTsx(page);
    await expect(drawer.locator('pre')).toContainText('Export me');
    await closeExportDrawer(page);
  });

  test('exports nested Card with Text child', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Text');
    const drawer = await exportTsx(page);
    const code = await drawer.locator('pre').textContent();
    expect(code).toContain('Card');
    expect(code).toContain('Text');
    await closeExportDrawer(page);
  });

  test('exports Stack layout component', async ({ page }) => {
    await insertFromPalette(page, 'Stack');
    const drawer = await exportTsx(page);
    await expect(drawer.locator('pre')).toContainText('Stack');
    await closeExportDrawer(page);
  });

  test('exports inline styles from Style sub-mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await styleInspector(page).getByLabel('Margin').fill('16');
    await styleInspector(page).getByLabel('Margin').blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 16);

    const drawer = await exportTsx(page);
    const code = await drawer.locator('pre').textContent();
    expect(code).toMatch(/margin|style/i);
    await closeExportDrawer(page);
  });

  test('exports grid placement properties', async ({ page }) => {
    await bootstrapGridWithButton(page);
    const drawer = await exportTsx(page);
    const code = await drawer.locator('pre').textContent();
    expect(code).toMatch(/gridColumn|gridRow/);
    await closeExportDrawer(page);
  });

  test('exports multiple nodes in document order', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    const drawer = await exportTsx(page);
    const code = (await drawer.locator('pre').textContent()) ?? '';
    const buttonTags = code.match(/<Button[\s>]/g) ?? [];
    expect(buttonTags.length).toBeGreaterThanOrEqual(2);
    await closeExportDrawer(page);
  });

  test('can reopen export drawer after close', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await exportTsx(page);
    await closeExportDrawer(page);
    const drawer = await exportTsx(page);
    await expect(drawer.locator('pre')).toContainText('Click me');
    await closeExportDrawer(page);
  });

  test('exports Heading typography component', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Heading');
    const drawer = await exportTsx(page);
    await expect(drawer.locator('pre')).toContainText('Heading');
    await closeExportDrawer(page);
  });

  test('reflects document node count in exported JSX', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    const drawer = await exportTsx(page);
    const code = (await drawer.locator('pre').textContent()) ?? '';
    const matches = code.match(/Click me/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
    await closeExportDrawer(page);
  });
});
