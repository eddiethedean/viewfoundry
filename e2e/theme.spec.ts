import { expect, test } from '@playwright/test';
import {
  THEME_STORAGE_KEY,
  bootstrapGridWithButton,
  resetDocument,
  resetTheme,
  selectLayer,
  setEditSubMode,
  setStudioMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('defaults to dark mode', async ({ page }) => {
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'dark');
  });

  test('switches to light mode from the toolbar', async ({ page }) => {
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'light');
  });

  test('switches back to dark mode', async ({ page }) => {
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    await toolbar(page).getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'dark');
  });

  test('persists theme preference across reload', async ({ page }) => {
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    await page.reload();
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'light');
  });

  test('reads stored theme on load', async ({ page }) => {
    await resetTheme(page, 'light');
    await expect(toolbar(page).getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
  });

  test('keeps theme when toggling Live mode', async ({ page }) => {
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    await bootstrapGridWithButton(page);
    await setStudioMode(page, 'Live');
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'light');
    await setStudioMode(page, 'Edit');
    await expect(toolbar(page).getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
  });

  test('stores theme in localStorage', async ({ page }) => {
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    const stored = await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY);
    expect(stored).toBe('light');
  });

  test('applies theme while editing in Style sub-mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');
    await toolbar(page).getByRole('button', { name: 'Switch to light mode' }).click();
    await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', 'light');
    await expect(styleInspector(page)).toBeVisible();
  });
});
