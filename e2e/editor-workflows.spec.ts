import { expect, test } from '@playwright/test';
import {
  bootstrapGridWithButton,
  demoButton,
  expectInspectorShowsType,
  expectStoredDocument,
  findNodeByType,
  firstGridChild,
  getStoredDocument,
  insertFromPalette,
  inspector,
  layers,
  palette,
  removeSelectedNode,
  resetDocument,
  selectLayer,
  setEditSubMode,
  setStudioMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('editor workflows', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('persists document across page reload', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    const textInput = inspector(page).getByRole('textbox', { name: 'Text' });
    await textInput.fill('Persisted label');

    await expect(demoButton(page, 'Persisted label')).toBeVisible();

    await page.reload();

    await expect(demoButton(page, 'Persisted label')).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeVisible();
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toBeVisible();
  });

  test('updates props from the inspector and reflects on canvas', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await expectInspectorShowsType(inspector(page), 'Button');

    const textInput = inspector(page).getByRole('textbox', { name: 'Text' });
    await textInput.fill('Updated text');

    await expect(demoButton(page, 'Updated text')).toBeVisible();

    await expectStoredDocument(page, (doc) => {
      const button = firstGridChild(doc);
      return button?.props?.children === 'Updated text';
    });
  });

  test('selects nodes from the layers panel and clears selection', async ({ page }) => {
    await bootstrapGridWithButton(page);

    await expectInspectorShowsType(inspector(page), 'Button');

    await page.getByTestId('vf-canvas-surface').click({ position: { x: 8, y: 8 } });
    await expect(inspector(page).getByText('Select a node to edit its properties')).toBeVisible();

    await selectLayer(page, /^Grid\b/);
    await expectInspectorShowsType(inspector(page), 'Grid');
  });

  test('clears selection with Escape', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await expectInspectorShowsType(inspector(page), 'Button');

    await page.keyboard.press('Escape');
    await expect(inspector(page).getByText('Select a node to edit its properties')).toBeVisible();
  });

  test('deletes the selected node from the toolbar', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await removeSelectedNode(page, 'Button');

    await expect(demoButton(page, 'Click me')).toBeHidden();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeHidden();
    await expect(layers(page).getByRole('button', { name: /^Grid\b/ })).toBeVisible();

    const stored = await getStoredDocument(page);
    const gridChildren = stored?.root.children?.[0]?.children ?? [];
    expect(gridChildren).toHaveLength(0);
  });

  test('deletes the selected node with Backspace', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await page.keyboard.press('Backspace');

    await expect(demoButton(page, 'Click me')).toBeHidden();
  });

  test('duplicates the selected node', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await toolbar(page).getByRole('button', { name: 'Duplicate' }).click();

    const buttonLayers = layers(page).getByRole('button', { name: /^Button\b/ });
    await expect(buttonLayers).toHaveCount(2);
    await expect(page.locator('.vf-canvas .demo-button')).toHaveCount(2);

    await expectStoredDocument(page, (doc) => {
      const gridChildren = doc.root.children?.[0]?.children ?? [];
      return gridChildren.length === 2 && gridChildren[0].id !== gridChildren[1].id;
    });
  });

  test('inserts into a selected Card container', async ({ page }) => {
    await insertFromPalette(page, 'Card');
    await selectLayer(page, /^Card\b/);
    await insertFromPalette(page, 'Text');

    await expect(layers(page).getByRole('button', { name: /^Text\b/ })).toBeVisible();
    await expect(page.locator('.demo-text')).toBeVisible();

    const stored = await getStoredDocument(page);
    expect(stored).not.toBeNull();
    const card = findNodeByType(stored!, 'Card');
    expect(card).toBeDefined();
    expect(card?.children?.[0]).toMatchObject({ type: 'Text' });
  });

  test('preserves edited props when switching Edit and Live modes', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('textbox', { name: 'Text' }).fill('Live preview');

    await setStudioMode(page, 'Live');
    await expect(demoButton(page, 'Live preview')).toBeVisible();

    await setStudioMode(page, 'Edit');
    await expect(demoButton(page, 'Live preview')).toBeVisible();
    await selectLayer(page, /^Button\b/);
    await expect(inspector(page).getByRole('textbox', { name: 'Text' })).toHaveValue(
      'Live preview',
    );
  });

  test('changes button variant from the inspector', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await inspector(page).getByRole('combobox', { name: 'Variant' }).selectOption('secondary');

    await expect(page.locator('.vf-canvas .demo-button--secondary')).toBeVisible();

    await expectStoredDocument(page, (doc) => {
      const button = firstGridChild(doc);
      return button?.props?.variant === 'secondary';
    });
  });

  test('edits node.style in Style sub-mode', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');

    await expect(palette(page)).toBeHidden();
    await expect(styleInspector(page)).toBeVisible();

    const marginInput = styleInspector(page).getByLabel('Margin');
    await marginInput.fill('12');
    await marginInput.blur();

    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 12);

    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === undefined);

    await toolbar(page).getByRole('button', { name: 'Redo' }).click();
    await expectStoredDocument(page, (doc) => firstGridChild(doc)?.style?.margin === 12);
  });

  test('preserves selection when switching Component and Style sub-modes', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);

    await setEditSubMode(page, 'Style');
    await expect(styleInspector(page).locator('.vf-inspector-meta')).toContainText('Button');

    await setEditSubMode(page, 'Component');
    await expect(inspector(page).locator('.vf-inspector-meta')).toContainText('Button');
  });

  test('shows backgroundColor on canvas and persists after reload', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');

    const backgroundInput = styleInspector(page).locator('#vf-style-backgroundColor-text');
    await backgroundInput.fill('#ff0000');
    await page.keyboard.press('Tab');

    await expectStoredDocument(
      page,
      (doc) => firstGridChild(doc)?.style?.backgroundColor === '#ff0000',
    );

    await expect(page.locator('.vf-canvas .demo-button')).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)',
    );

    await page.reload();
    await expect(page.locator('.vf-canvas .demo-button')).toHaveCSS(
      'background-color',
      'rgb(255, 0, 0)',
    );
  });

  test('exports node.style in generated TSX', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await setEditSubMode(page, 'Style');

    const backgroundInput = styleInspector(page).locator('#vf-style-backgroundColor-text');
    await backgroundInput.fill('#00ff00');
    await page.keyboard.press('Tab');

    await expectStoredDocument(
      page,
      (doc) => firstGridChild(doc)?.style?.backgroundColor === '#00ff00',
    );

    await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();
    const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
    const code = await drawer.locator('pre').textContent();
    expect(code).toContain('backgroundColor');
    expect(code).toMatch(/#00ff00|#0f0/i);
  });
});
