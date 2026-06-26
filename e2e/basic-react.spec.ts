import { expect, test } from '@playwright/test';

test.describe('basic-react example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('opens in Edit mode with editor chrome', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ViewFoundry/ })).toBeVisible();
    await expect(
      page.locator('.vf-palette').getByText('Components', { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('.vf-inspector').getByText('Inspector', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
  });

  test('inserts a component from the palette with grid bootstrap', async ({ page }) => {
    const palette = page.locator('.vf-palette');
    await palette.getByRole('button', { name: 'Button', exact: true }).click();

    await expect(page.locator('.vf-layers').getByRole('button', { name: /Grid/ })).toBeVisible();
    await expect(page.locator('.vf-layers').getByRole('button', { name: /Button/ })).toBeVisible();
    await expect(page.locator('.demo-button')).toBeVisible();

    const stored = await page.evaluate(() =>
      localStorage.getItem('viewfoundry-basic-react-document'),
    );
    expect(stored).toContain('"layout"');
    expect(stored).toContain('"grid"');
  });

  test('inserts into a selected grid container', async ({ page }) => {
    const palette = page.locator('.vf-palette');
    await palette.getByRole('button', { name: 'Grid', exact: true }).click();

    const gridLayer = page.locator('.vf-layers').getByRole('button', { name: /Grid/ });
    await gridLayer.click();
    await palette.getByRole('button', { name: 'Heading', exact: true }).click();

    await expect(page.locator('.demo-grid')).toBeVisible();
    await expect(page.locator('.vf-layers').getByRole('button', { name: /Heading/ })).toBeVisible();

    const stored = await page.evaluate(() =>
      localStorage.getItem('viewfoundry-basic-react-document'),
    );
    expect(stored).toContain('"layout"');
  });

  test('toggles Live mode and keeps the canvas interactive', async ({ page }) => {
    const palette = page.locator('.vf-palette');
    await palette.getByRole('button', { name: 'Button', exact: true }).click();

    await page.getByRole('button', { name: 'Live' }).click();

    await expect(page.getByText('Components')).toBeHidden();
    await expect(page.locator('.vf-inspector')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Click me' })).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(
      page.locator('.vf-palette').getByText('Components', { exact: true }),
    ).toBeVisible();
  });

  test('exports TSX from the toolbar', async ({ page }) => {
    const palette = page.locator('.vf-palette');
    await palette.getByRole('button', { name: 'Button', exact: true }).click();

    await page.getByRole('button', { name: 'Export TSX' }).click();

    const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('pre')).toContainText('export function DemoView');
    await expect(drawer.locator('pre')).toContainText('Click me');

    await drawer.getByRole('button', { name: 'Close' }).click();
    await expect(drawer).toBeHidden();
  });
});
