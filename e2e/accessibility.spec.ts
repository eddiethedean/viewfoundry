import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  closeExportDrawer,
  exportTsx,
  inspector,
  layers,
  palette,
  resetDocument,
  selectLayer,
  setEditSubMode,
  setStudioMode,
  toolbar,
} from './helpers.js';

test.describe('accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('toolbar mode group has accessible label', async ({ page }) => {
    await expect(page.getByRole('group', { name: 'Studio mode' })).toBeVisible();
  });

  test('edit sub-mode group has accessible label', async ({ page }) => {
    await expect(page.getByRole('group', { name: 'Edit sub-mode' })).toBeVisible();
  });

  test('Edit mode toggle exposes pressed state', async ({ page }) => {
    await expect(toolbar(page).getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
  });

  test('Component sub-mode toggle exposes pressed state', async ({ page }) => {
    await expect(
      toolbar(page).getByRole('button', { name: 'Component', pressed: true }),
    ).toBeVisible();
  });

  test('Style sub-mode toggle exposes pressed state after switch', async ({ page }) => {
    await setEditSubMode(page, 'Style');
    await expect(toolbar(page).getByRole('button', { name: 'Style', pressed: true })).toBeVisible();
  });

  test('theme toggle has descriptive aria label', async ({ page }) => {
    await expect(toolbar(page).getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });

  test('palette search input has accessible label', async ({ page }) => {
    await expect(palette(page).getByRole('searchbox', { name: 'Search components' })).toBeVisible();
  });

  test('palette component buttons are keyboard focusable', async ({ page }) => {
    await palette(page).getByRole('button', { name: 'Button', exact: true }).focus();
    await expect(palette(page).getByRole('button', { name: 'Button', exact: true })).toBeFocused();
  });

  test('export dialog is announced as a dialog', async ({ page }) => {
    await bootstrapGridWithButton(page);
    const drawer = await exportTsx(page);
    await expect(drawer).toHaveAttribute('role', 'dialog');
    await closeExportDrawer(page);
  });

  test('toolbar error uses alert role', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(page.locator('.vf-toolbar-error')).toHaveAttribute('role', 'alert');
  });

  test('Live mode toggle exposes pressed state', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(toolbar(page).getByRole('button', { name: 'Live', pressed: true })).toBeVisible();
  });

  test('undo and duplicate buttons have accessible names', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await expect(toolbar(page).getByRole('button', { name: 'Undo' })).toBeVisible();
    await expect(toolbar(page).getByRole('button', { name: 'Duplicate' })).toBeVisible();
  });

  test('remove action uses a descriptive label in the inspector', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expect(
      inspector(page).getByRole('button', { name: 'Remove Button from canvas' }),
    ).toBeVisible();
  });

  test('layer remove buttons are reachable by role', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await layers(page).locator('.vf-layer-row').first().hover();
    await expect(
      layers(page).getByRole('button', { name: 'Remove Button from layers' }),
    ).toBeVisible();
  });

  test('layers panel buttons are reachable by role', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await expect(page.locator('.vf-layers').getByRole('button', { name: /^Root\b/ })).toBeVisible();
    await expect(
      page.locator('.vf-layers').getByRole('button', { name: /^Button\b/ }),
    ).toBeVisible();
  });
});
