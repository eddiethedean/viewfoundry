import { expect, test } from '@playwright/test';

test.describe('docs embedded studio', () => {
  test('studio page iframe loads the editor', async ({ page }) => {
    await page.goto('/studio.html');
    const frame = page.frameLocator('#viewfoundry-studio-embed');
    await expect(frame.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await expect(frame.getByRole('button', { name: 'Button' }).first()).toBeVisible();
  });

  test('inserts a component from the palette', async ({ page }) => {
    await page.goto('/studio.html');
    const frame = page.frameLocator('#viewfoundry-studio-embed');
    await expect(frame.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await frame.getByRole('button', { name: 'Button' }).first().click();
    await expect(frame.locator('.demo-button', { hasText: 'Click me' })).toBeVisible();
  });

  test('standalone studio bundle loads', async ({ page }) => {
    await page.goto('/_static/studio/index.html');
    await expect(page.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Export TSX' })).toBeVisible();
  });
});
