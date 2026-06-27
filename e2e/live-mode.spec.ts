import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  inspector,
  layers,
  palette,
  resetDocument,
  selectLayer,
  setEditSubMode,
  setStudioMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('Live mode', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('hides palette, layers, and inspector', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(palette(page)).toBeHidden();
    await expect(layers(page)).toBeHidden();
    await expect(inspector(page)).toBeHidden();
  });

  test('hides edit toolbar actions in Live mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(toolbar(page).getByRole('button', { name: 'Undo' })).toBeHidden();
    await expect(toolbar(page).getByRole('button', { name: 'Duplicate' })).toBeHidden();
    await expect(toolbar(page).getByRole('button', { name: 'Export TSX' })).toBeHidden();
    await expect(page.locator('.vf-node-actions')).toBeHidden();
  });

  test('keeps rendered output visible', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('allows clicking an enabled button', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await demoButton(page, 'Click me').click({ trial: true });
  });

  test('shows disabled buttons as non-interactive', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('checkbox', { name: 'Disabled' }).check();
    await setStudioMode(page, 'Live');
    await expect(page.locator('.demo-button')).toBeDisabled();
  });

  test('returns to Edit mode with full chrome', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await setStudioMode(page, 'Edit');
    await expect(palette(page)).toBeVisible();
    await expect(layers(page)).toBeVisible();
    await expect(inspector(page)).toBeVisible();
  });

  test('preserves prop edits across Live toggle', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('textbox', { name: 'Text' }).fill('Live label');
    await setStudioMode(page, 'Live');
    await expect(demoButton(page, 'Live label')).toBeVisible();
    await setStudioMode(page, 'Edit');
    await selectLayer(page, /^Button\b/);
    await expect(inspector(page).getByRole('textbox', { name: 'Text' })).toHaveValue('Live label');
  });

  test('preserves style edits across Live toggle', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await styleInspector(page).getByLabel('Margin').fill('20');
    await styleInspector(page).getByLabel('Margin').blur();
    await setStudioMode(page, 'Live');
    await setStudioMode(page, 'Edit');
    await setEditSubMode(page, 'Style');
    await expect(styleInspector(page).getByLabel('Margin')).toHaveValue('20');
  });

  test('shows Edit and Live mode toggle in Live mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(toolbar(page).getByRole('button', { name: 'Live', pressed: true })).toBeVisible();
    await expect(toolbar(page).getByRole('button', { name: 'Edit' })).toBeVisible();
  });
});
