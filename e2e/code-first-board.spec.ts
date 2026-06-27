import { expect, test } from '@playwright/test';

const codeFirstUrl = '/?mode=code-first';

test.describe('code-first board', () => {
  test('loads board editor with Elements and Properties panels', async ({ page }) => {
    await page.goto(codeFirstUrl);
    await expect(page.getByRole('heading', { name: /Code-first Board/i })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Elements' })).toBeVisible();
    await expect(page.getByTestId('vf-code-first-stage')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
  });

  test('selects element from Elements tree and edits prop in source', async ({ page }) => {
    await page.goto(codeFirstUrl);
    await page
      .getByRole('region', { name: 'Elements' })
      .getByRole('button', { name: 'Button' })
      .click();
    await expect(page.getByRole('region', { name: 'Properties' })).toContainText('Button');

    const variantSelect = page.getByLabel('Variant');
    await variantSelect.selectOption('secondary');

    const source = page.getByTestId('source-content');
    await expect(source).toContainText('secondary');
    await expect(page.locator('.demo-button--secondary')).toBeVisible();
  });

  test('undo restores prior source after prop edit', async ({ page }) => {
    await page.goto(codeFirstUrl);
    await page
      .getByRole('region', { name: 'Elements' })
      .getByRole('button', { name: 'Button' })
      .click();
    await page.getByLabel('Variant').selectOption('secondary');
    await expect(page.getByTestId('source-content')).toContainText('secondary');

    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByTestId('source-content')).toContainText('primary');
    await expect(page.locator('.demo-button--primary')).toBeVisible();
  });

  test('toggles parent-first and child-first click modes', async ({ page }) => {
    await page.goto(codeFirstUrl);
    await expect(page.getByRole('button', { name: 'Parent first', pressed: true })).toBeVisible();
    await page.getByRole('button', { name: 'Child first' }).click();
    await expect(page.getByRole('button', { name: 'Child first', pressed: true })).toBeVisible();
  });

  test('parent-first second click selects parent in Elements tree', async ({ page }) => {
    await page.goto(codeFirstUrl);
    const stage = page.getByTestId('vf-code-first-stage');
    await stage.locator('.demo-button').click();
    await expect(
      page
        .getByRole('region', { name: 'Elements' })
        .getByRole('button', { name: 'Button', pressed: true }),
    ).toBeVisible();
    await stage.locator('.demo-button').click();
    await expect(
      page
        .getByRole('region', { name: 'Elements' })
        .getByRole('button', { name: 'Stack', pressed: true }),
    ).toBeVisible();
  });

  test('switches to Live mode and hides edit panels', async ({ page }) => {
    await page.goto(codeFirstUrl);
    await page.getByRole('button', { name: 'Live' }).click();
    await expect(page.getByRole('region', { name: 'Elements' })).toBeHidden();
    await expect(page.getByTestId('vf-code-first-stage')).toBeVisible();
  });
});
