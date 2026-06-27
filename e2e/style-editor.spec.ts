import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  expectStoredDocument,
  firstGridChild,
  palette,
  resetDocument,
  selectLayer,
  setEditSubMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('style editor', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
  });

  test('shows Style panel header and selected node metadata', async ({ page }) => {
    await expect(styleInspector(page).getByText('Style', { exact: true })).toBeVisible();
    await expect(styleInspector(page).locator('.vf-inspector-meta')).toContainText('Button');
  });

  test('hides palette in Style sub-mode', async ({ page }) => {
    await expect(palette(page)).toBeHidden();
  });

  test('shows grouped style sections', async ({ page }) => {
    await expect(styleInspector(page).getByText('Spacing', { exact: true })).toBeVisible();
    await expect(styleInspector(page).getByText('Size', { exact: true })).toBeVisible();
    await expect(styleInspector(page).getByText('Colors', { exact: true })).toBeVisible();
    await expect(styleInspector(page).getByText('Typography', { exact: true })).toBeVisible();
    await expect(styleInspector(page).getByRole('heading', { name: 'Border' })).toBeVisible();
    await expect(styleInspector(page).getByText('Layout', { exact: true })).toBeVisible();
  });

  test('edits margin spacing', async ({ page }) => {
    const input = styleInspector(page).getByLabel('Margin');
    await input.fill('8');
    await input.blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 8);
  });

  test('edits padding spacing', async ({ page }) => {
    const input = styleInspector(page).getByLabel('Padding');
    await input.fill('16');
    await input.blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.padding === 16);
  });

  test('edits width and height', async ({ page }) => {
    await styleInspector(page).getByRole('textbox', { name: 'Width', exact: true }).fill('200');
    await styleInspector(page).getByRole('textbox', { name: 'Width', exact: true }).blur();
    await styleInspector(page).getByRole('textbox', { name: 'Height', exact: true }).fill('48');
    await styleInspector(page).getByRole('textbox', { name: 'Height', exact: true }).blur();
    await expectStoredDocument(page, (doc) => {
      const style = firstGridChild(doc)?.style;
      return style?.width === 200 && style?.height === 48;
    });
  });

  test('edits background color', async ({ page }) => {
    const input = styleInspector(page).locator('#vf-style-backgroundColor-text');
    await input.fill('#336699');
    await page.keyboard.press('Tab');
    await expectStoredDocument(
      page,
      (doc) => firstGridChild(doc)?.style?.backgroundColor === '#336699',
    );
  });

  test('edits text color', async ({ page }) => {
    const input = styleInspector(page).locator('#vf-style-color-text');
    await input.fill('#ffffff');
    await page.keyboard.press('Tab');
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.color === '#ffffff');
  });

  test('edits font size', async ({ page }) => {
    await styleInspector(page).getByLabel('Font size').fill('18');
    await styleInspector(page).getByLabel('Font size').blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.fontSize === 18);
  });

  test('edits border radius', async ({ page }) => {
    await styleInspector(page).getByLabel('Border radius').fill('8');
    await styleInspector(page).getByLabel('Border radius').blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.borderRadius === 8);
  });

  test('selects text align from dropdown', async ({ page }) => {
    await styleInspector(page).getByLabel('Text align').selectOption('center');
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.textAlign === 'center');
  });

  test('selects display from layout dropdown', async ({ page }) => {
    await styleInspector(page).getByLabel('Display').selectOption('flex');
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.display === 'flex');
  });

  test('expands Advanced section for custom properties', async ({ page }) => {
    await styleInspector(page).getByRole('button', { name: 'Advanced' }).click();
    await expect(styleInspector(page).getByPlaceholder('camelCaseKey')).toBeVisible();
    await expect(styleInspector(page).getByText('Add property', { exact: true })).toBeVisible();
  });

  test('applies margin to canvas element', async ({ page }) => {
    await styleInspector(page).getByLabel('Margin').fill('24');
    await styleInspector(page).getByLabel('Margin').blur();
    await expect(page.locator('.vf-canvas .demo-button')).toHaveCSS('margin-top', '24px');
  });

  test('supports undo after style edit', async ({ page }) => {
    await styleInspector(page).getByLabel('Margin').fill('10');
    await styleInspector(page).getByLabel('Margin').blur();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 10);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === undefined);
  });

  test('shows empty state when nothing is selected', async ({ page }) => {
    await page.getByTestId('vf-canvas-surface').click({ position: { x: 8, y: 8 } });
    await expect(styleInspector(page).getByText('Select a node to edit its style')).toBeVisible();
  });
});
