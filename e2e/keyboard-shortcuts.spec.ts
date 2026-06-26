import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  inspector,
  layers,
  MOD_KEY,
  pressEditorShortcut,
  resetDocument,
  selectLayer,
  toolbar,
} from './helpers.js';

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('duplicates the selected node with Mod+D', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await pressEditorShortcut(page, page, `${MOD_KEY}+KeyD`);

    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);
    await expect(page.locator('.vf-canvas .demo-button')).toHaveCount(2);
  });

  test('undoes and redoes an insert with Mod+Z and Mod+Y', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await expect(demoButton(page, 'Click me')).toBeVisible();

    await pressEditorShortcut(page, page, `${MOD_KEY}+KeyZ`);
    await expect(demoButton(page, 'Click me')).toBeHidden();

    await pressEditorShortcut(page, page, `${MOD_KEY}+KeyY`);
    await expect(demoButton(page, 'Click me')).toBeVisible();
  });

  test('does not delete the node when Backspace is typed in the inspector', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    const textInput = inspector(page).getByRole('textbox', { name: 'Text' });
    await textInput.click();
    await textInput.press('End');
    await page.keyboard.press('Backspace');

    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeVisible();
    await expect(demoButton(page, 'Click m')).toBeVisible();
  });

  test('does not undo document edits when Mod+Z is pressed while editing inspector text', async ({
    page,
  }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    const textInput = inspector(page).getByRole('textbox', { name: 'Text' });
    await textInput.click();
    await textInput.fill('Edited label');

    await textInput.press(`${MOD_KEY}+KeyZ`);

    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toBeVisible();
  });

  test('clears selection with Escape', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expect(inspector(page).locator('.vf-inspector-meta')).toContainText('Button');

    await pressEditorShortcut(page, page, 'Escape');

    await expect(inspector(page).getByText('Select a node to edit its properties')).toBeVisible();
  });

  test('enables Undo after an edit and disables Redo until redo is performed', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await expect(toolbar(page).getByRole('button', { name: 'Undo' })).toBeEnabled();
    await expect(toolbar(page).getByRole('button', { name: 'Redo' })).toBeDisabled();

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(toolbar(page).getByRole('button', { name: 'Redo' })).toBeEnabled();
  });
});
