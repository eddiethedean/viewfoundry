import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  expectStoredDocument,
  findNodeByType,
  insertFromPalette,
  insertIntoSelectedContainer,
  inspector,
  layers,
  resetDocument,
  selectLayer,
} from './helpers.js';

test.describe('demo components', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('renders Card with editable title', async ({ page }) => {
    await insertFromPalette(page, 'Card');
    await selectLayer(page, /^Card\b/);
    await inspector(page).getByRole('textbox', { name: 'Title' }).fill('My card');
    await expect(page.locator('.demo-card', { hasText: 'My card' })).toBeVisible();
  });

  test('renders Stack with horizontal direction', async ({ page }) => {
    await insertFromPalette(page, 'Stack');
    await selectLayer(page, /^Stack\b/);
    await inspector(page).getByRole('combobox', { name: 'Direction' }).selectOption('horizontal');
    await expect(page.locator('.demo-stack--horizontal')).toHaveClass(/demo-stack--horizontal/);
    await expectStoredDocument(page, (doc) => {
      const stack = findNodeByType(doc, 'Stack') as { props?: { direction?: string } } | undefined;
      return stack?.props?.direction === 'horizontal';
    });
  });

  test('renders Stack with custom gap', async ({ page }) => {
    await insertFromPalette(page, 'Stack');
    await selectLayer(page, /^Stack\b/);
    await inspector(page).getByRole('spinbutton', { name: 'Gap' }).fill('24');
    await expectStoredDocument(page, (doc) => {
      const stack = findNodeByType(doc, 'Stack') as { props?: { gap?: number } } | undefined;
      return stack?.props?.gap === 24;
    });
  });

  test('renders Grid with custom column count', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await inspector(page).getByRole('spinbutton', { name: 'Columns' }).fill('3');
    await expectStoredDocument(page, (doc) => {
      const grid = findNodeByType(doc, 'Grid') as { props?: { columns?: number } } | undefined;
      return grid?.props?.columns === 3;
    });
    await expect(page.locator('.demo-grid')).toHaveCSS('grid-template-columns', /211\.|repeat\(3/);
  });

  test('renders Row container', async ({ page }) => {
    await insertFromPalette(page, 'Row');
    await expect(layers(page).getByRole('button', { name: /^Row\b/ })).toBeVisible();
    await expect(page.locator('.demo-row')).toHaveClass(/demo-row/);
  });

  test('renders Heading levels', async ({ page }) => {
    await insertFromPalette(page, 'Heading');
    await selectLayer(page, /^Heading\b/);
    await inspector(page).getByRole('combobox', { name: 'Level' }).selectOption('h1');
    await expect(page.locator('.demo-heading--h1')).toBeVisible();
  });

  test('renders Text with size variants', async ({ page }) => {
    await insertFromPalette(page, 'Text');
    await selectLayer(page, /^Text\b/);
    await inspector(page).getByRole('combobox', { name: 'Size' }).selectOption('lg');
    await expect(page.locator('.demo-text--lg')).toBeVisible();
  });

  test('renders disabled Button', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('checkbox', { name: 'Disabled' }).check();
    await expect(page.locator('.demo-button')).toBeDisabled();
  });

  test('renders ghost Button variant', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('combobox', { name: 'Variant' }).selectOption('ghost');
    await expect(page.locator('.demo-button--ghost')).toBeVisible();
  });

  test('nests Text inside Card', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Card', 'Text');
    await selectLayer(page, /^Text\b/);
    await inspector(page).getByRole('textbox', { name: 'Text' }).fill('Inside card');
    await expect(page.locator('.demo-text', { hasText: 'Inside card' })).toBeVisible();
    const stored = await page.evaluate(() =>
      localStorage.getItem('viewfoundry-basic-react-document'),
    );
    expect(stored).toContain('"type":"Text"');
    expect(stored).toContain('"type":"Card"');
  });

  test('nests Button inside Stack', async ({ page }) => {
    await insertIntoSelectedContainer(page, 'Stack', 'Button');
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Stack\b/ })).toBeVisible();
  });

  test('builds nested grid inside root grid', async ({ page }) => {
    await insertFromPalette(page, 'Grid');
    await selectLayer(page, /^Grid\b/);
    await insertFromPalette(page, 'Grid');
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toHaveCount(2);
  });

  test('inserts multiple buttons into bootstrapped grid', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await insertFromPalette(page, 'Button');
    await insertFromPalette(page, 'Button');
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toHaveCount(3);
  });
});
