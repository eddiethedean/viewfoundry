import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  getStoredDocument,
  insertFromPalette,
  inspector,
  layers,
  layerButton,
  palette,
  resetDocument,
  selectLayer,
  setStudioMode,
  toolbar,
} from './helpers.js';

test.describe('basic-react example', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('opens in Edit mode with editor chrome', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ViewFoundry/ })).toBeVisible();
    await expect(palette(page).getByText('Components', { exact: true })).toBeVisible();
    await expect(inspector(page).getByText('Inspector', { exact: true })).toBeVisible();
    await expect(layers(page).getByText('Layers', { exact: true })).toBeVisible();
    await expect(toolbar(page).getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
    await expect(toolbar(page).getByRole('button', { name: 'Undo' })).toBeDisabled();
    await expect(toolbar(page).getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  test('inserts a component from the palette with grid bootstrap', async ({ page }) => {
    await bootstrapGridWithButton(page);

    await expect(demoButton(page, 'Click me')).toBeVisible();

    const stored = await getStoredDocument(page);
    expect(stored).not.toBeNull();
    expect(JSON.stringify(stored)).toContain('"layout"');
    expect(JSON.stringify(stored)).toContain('"grid"');
  });

  test('inserts into a selected grid container', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Heading');

    await expect(page.locator('.demo-grid')).toBeVisible();
    await expect(layerButton(page, /^Heading\b/)).toBeVisible();

    const stored = await getStoredDocument(page);
    expect(stored).not.toBeNull();
    expect(JSON.stringify(stored)).toContain('"layout"');
  });

  test('toggles Live mode and keeps the canvas interactive', async ({ page }) => {
    await bootstrapGridWithButton(page);

    await setStudioMode(page, 'Live');

    await expect(page.getByText('Components')).toBeHidden();
    await expect(inspector(page)).toBeHidden();
    await expect(layers(page)).toBeHidden();
    await expect(toolbar(page).getByRole('button', { name: 'Undo' })).toBeHidden();
    await expect(demoButton(page, 'Click me')).toBeVisible();

    await setStudioMode(page, 'Edit');
    await expect(palette(page).getByText('Components', { exact: true })).toBeVisible();
  });

  test('exports TSX from the toolbar', async ({ page }) => {
    await bootstrapGridWithButton(page);

    await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();

    const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('pre')).toContainText('export function DemoView');
    await expect(drawer.locator('pre')).toContainText('Click me');
    await expect(drawer.locator('pre')).toContainText('Button');

    await drawer.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).toBeHidden();
  });

  test('filters the palette with search', async ({ page }) => {
    const search = palette(page).getByPlaceholder('Search components...');
    await search.fill('Heading');

    await expect(palette(page).getByRole('button', { name: 'Heading', exact: true })).toBeVisible();
    await expect(palette(page).getByRole('button', { name: 'Button', exact: true })).toBeHidden();

    await search.fill('');
    await expect(palette(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();
  });

  test('shows warning when saved document fails validation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: '0.1',
          root: {
            id: 'root',
            type: 'Root',
            children: [{ id: 'bad', type: 'NotRegistered', props: {} }],
          },
        }),
      );
    }, 'viewfoundry-basic-react-document');
    await page.reload();
    await expect(page.getByTestId('load-warning')).toBeVisible();
    await expect(page.getByTestId('load-warning')).toContainText('could not be loaded');
  });
});
