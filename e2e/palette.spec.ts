import { expect, test } from '@playwright/test';
import {
  PALETTE_COMPONENTS,
  bootstrapGridWithButton,
  clearPaletteSearch,
  insertFromPalette,
  layerButton,
  palette,
  resetDocument,
} from './helpers.js';

test.describe('palette', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('lists all registered demo components', async ({ page }) => {
    for (const name of PALETTE_COMPONENTS) {
      await expect(palette(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('shows category group labels', async ({ page }) => {
    await expect(palette(page).getByText('Controls', { exact: true })).toBeVisible();
    await expect(palette(page).getByText('Layout', { exact: true })).toBeVisible();
    await expect(palette(page).getByText('Typography', { exact: true })).toBeVisible();
  });

  for (const component of PALETTE_COMPONENTS) {
    test(`inserts ${component} from the palette`, async ({ page }) => {
      await insertFromPalette(page, component);
      await expect(layerButton(page, new RegExp(`^${component}\\b`))).toBeVisible();
    });
  }

  test('filters components by partial name match', async ({ page }) => {
    const search = palette(page).getByPlaceholder('Search components...');
    await search.fill('ead');
    await expect(palette(page).getByRole('button', { name: 'Heading', exact: true })).toBeVisible();
    await expect(palette(page).getByRole('button', { name: 'Button', exact: true })).toBeHidden();
  });

  test('filters components by category name', async ({ page }) => {
    await palette(page).getByPlaceholder('Search components...').fill('Typography');
    await expect(palette(page).getByRole('button', { name: 'Heading', exact: true })).toBeVisible();
    await expect(palette(page).getByRole('button', { name: 'Text', exact: true })).toBeVisible();
    await expect(palette(page).getByRole('button', { name: 'Button', exact: true })).toBeHidden();
  });

  test('hides empty categories while filtering', async ({ page }) => {
    await palette(page).getByPlaceholder('Search components...').fill('Button');
    await expect(palette(page).getByText('Layout', { exact: true })).toBeHidden();
    await expect(palette(page).getByText('Typography', { exact: true })).toBeHidden();
  });

  test('restores full palette after clearing search', async ({ page }) => {
    await palette(page).getByPlaceholder('Search components...').fill('Grid');
    await expect(palette(page).getByRole('button', { name: 'Card', exact: true })).toBeHidden();
    await clearPaletteSearch(page);
    await expect(palette(page).getByRole('button', { name: 'Card', exact: true })).toBeVisible();
  });

  test('returns no results for unknown search terms', async ({ page }) => {
    await palette(page).getByPlaceholder('Search components...').fill('zzznomatch');
    for (const name of PALETTE_COMPONENTS) {
      await expect(palette(page).getByRole('button', { name, exact: true })).toBeHidden();
    }
  });

  test('keeps palette usable after inserting a component', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await clearPaletteSearch(page);
    await insertFromPalette(page, 'Heading');
    await expect(layerButton(page, /^Heading\b/)).toBeVisible();
    await expect(palette(page).getByRole('button', { name: 'Text', exact: true })).toBeVisible();
  });
});
