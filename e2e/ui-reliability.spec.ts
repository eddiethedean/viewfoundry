import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  expectStoredDocument,
  firstGridChild,
  insertFromPalette,
  layers,
  resetDocument,
  selectLayer,
  toolbar,
  toolbarError,
} from './helpers.js';

test.describe('UI reliability', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('undo restores a deleted node', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Delete' }).click();

    await expect(demoButton(page, 'Click me')).toBeHidden();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('survives multiple undo and redo operations', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(1);

    await toolbar(page).getByRole('button', { name: 'Redo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(0);
  });

  test('shows a toolbar error when grid nudge moves out of bounds', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await expect(toolbarError(page)).toBeVisible();
    await expect(toolbarError(page)).toContainText(/out of bounds/i);
  });

  test('clears toolbar error after a successful edit', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await expect(toolbarError(page)).toBeVisible();

    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await expect(toolbarError(page)).toBeHidden();
  });

  test('dismisses invalid localStorage warning and keeps editing', async ({ page }) => {
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

    const warning = page.getByTestId('load-warning');
    await expect(warning).toBeVisible();
    await warning.getByRole('button', { name: 'Dismiss' }).click();
    await expect(warning).toBeHidden();

    await insertFromPalette(page, 'Button');
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('resets to seed document from load warning', async ({ page }) => {
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

    await page
      .getByTestId('load-warning')
      .getByRole('button', { name: 'Reset to seed document' })
      .click();
    await expect(page.getByTestId('load-warning')).toBeHidden();
    await expect(layers(page).getByRole('button', { name: /^Root\b/ })).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toBeHidden();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeHidden();
  });

  test('inserts Heading with updated text into nested grid', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Heading');
    await selectLayer(page, /^Heading\b/);

    await page.locator('.vf-inspector').getByRole('textbox', { name: 'Text' }).fill('Hello grid');

    await expect(page.locator('.vf-canvas .demo-heading', { hasText: 'Hello grid' })).toBeVisible();
    await expectStoredDocument(page, (doc) => {
      const heading = doc.root.children?.[0]?.children?.[0];
      return heading?.type === 'Heading' && heading.props?.children === 'Hello grid';
    });
  });

  test('duplicate assigns fresh ids and grid placement', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();

    await expectStoredDocument(page, (doc) => {
      const children = doc.root.children?.[0]?.children ?? [];
      if (children.length !== 2) return false;
      const [a, b] = children;
      return (
        a.id !== b.id &&
        a.layout?.grid !== undefined &&
        b.layout?.grid !== undefined &&
        (a.layout.grid.column !== b.layout.grid.column || a.layout.grid.row !== b.layout.grid.row)
      );
    });
  });

  test('preserves grid metadata after undoing duplicate', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    const beforeColumn = await page.evaluate(() => {
      const raw = localStorage.getItem('viewfoundry-basic-react-document');
      if (!raw) return null;
      const doc = JSON.parse(raw);
      return doc.root.children?.[0]?.children?.[0]?.layout?.grid?.column ?? null;
    });

    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();

    await expectStoredDocument(page, (doc) => {
      const button = firstGridChild(doc);
      return button?.layout?.grid?.column === beforeColumn;
    });
  });
});
