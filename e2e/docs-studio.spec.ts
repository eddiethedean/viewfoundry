import { expect, test } from '@playwright/test';
import {
  DOCS_STUDIO_STORAGE_KEY,
  bootstrapGridWithButton,
  demoButton,
  docsStudioFrame,
  expectStoredDocument,
  inspector,
  layers,
  MOD_KEY,
  palette,
  pressEditorShortcut,
  resetDocsStudioEmbedded,
  resetStandaloneDocsStudio,
  selectLayer,
  setEditSubMode,
  setStudioMode,
  styleInspector,
  toolbar,
} from './helpers.js';

test.describe('docs embedded studio', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocsStudioEmbedded(page);
  });

  test('studio page iframe loads the editor chrome', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await expect(frame.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await expect(frame.getByRole('button', { name: 'Button' }).first()).toBeVisible();
    await expect(frame.locator('.vf-palette')).toBeVisible();
    await expect(frame.locator('.vf-inspector')).toBeVisible();
    await expect(frame.locator('.vf-layers')).toBeVisible();
  });

  test('inserts a component from the palette', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);
    await expect(demoButton(frame, 'Click me')).toBeVisible();
  });

  test('toggles Live mode and hides editor chrome', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);

    await setStudioMode(frame, 'Live');
    await expect(palette(frame)).toBeHidden();
    await expect(inspector(frame)).toBeHidden();
    await expect(demoButton(frame, 'Click me')).toBeVisible();

    await setStudioMode(frame, 'Edit');
    await expect(palette(frame)).toBeVisible();
  });

  test('persists document in localStorage across reload', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);
    await selectLayer(frame, /^Button\b/);
    await inspector(frame).getByRole('textbox', { name: 'Text' }).fill('Docs persist');

    await page.reload();
    await expect(docsStudioFrame(page).locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await expect(
      docsStudioFrame(page).locator('.demo-button', { hasText: 'Docs persist' }),
    ).toBeVisible();

    await expectStoredDocument(
      page,
      (doc) => doc.root.children?.[0]?.children?.[0]?.props?.children === 'Docs persist',
      undefined,
      DOCS_STUDIO_STORAGE_KEY,
    );
  });

  test('exports TSX from the toolbar', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);

    await toolbar(frame).getByRole('button', { name: 'Export TSX' }).click();
    const dialog = frame.getByRole('dialog', { name: 'Generated TSX' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('pre')).toContainText('DocsStudioView');
    await expect(dialog.locator('pre')).toContainText('Click me');
  });

  test('shows and hides document JSON', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);

    await frame.getByRole('button', { name: 'Show JSON' }).click();
    const jsonPanel = frame.getByRole('region', { name: 'Document JSON' });
    await expect(jsonPanel).toBeVisible();
    await expect(jsonPanel.locator('pre')).toContainText('"type": "Button"');

    await frame.getByRole('button', { name: 'Hide JSON' }).click();
    await expect(jsonPanel).toBeHidden();
  });

  test('edits style in Style sub-mode', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);
    await selectLayer(frame, /^Button\b/);
    await setEditSubMode(frame, 'Style');

    await expect(palette(frame)).toBeHidden();
    const marginInput = styleInspector(frame).getByLabel('Margin');
    await marginInput.fill('8');
    await marginInput.blur();

    await expectStoredDocument(
      page,
      (doc) => doc.root.children?.[0]?.children?.[0]?.style?.margin === 8,
      undefined,
      DOCS_STUDIO_STORAGE_KEY,
    );
  });

  test('supports keyboard duplicate in the iframe', async ({ page }) => {
    const frame = docsStudioFrame(page);
    await bootstrapGridWithButton(frame);
    await selectLayer(frame, /^Button\b/);

    await pressEditorShortcut(page, frame, `${MOD_KEY}+KeyD`);

    await expect(layers(frame).getByRole('button', { name: /^Button\b/ })).toHaveCount(2);
  });

  test('open-in-new-tab link targets the studio bundle', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Open the Studio in a new tab/i })).toHaveAttribute(
      'href',
      '_static/studio/index.html',
    );
  });

  test('toggles full screen on the embed', async ({ page }) => {
    const root = page.locator('#viewfoundry-studio-embed-root');
    const toggle = page.locator('#studio-fullscreen-toggle');

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Enter full screen');
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('aria-label', 'Exit full screen');
    await expect(root).toHaveClass(/studio-embed--fullscreen/);

    const frame = docsStudioFrame(page);
    await expect(frame.locator('.vf-editor')).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('aria-label', 'Enter full screen');
    await expect(root).not.toHaveClass(/studio-embed--fullscreen/);
  });
});

test.describe('docs standalone studio', () => {
  test.beforeEach(async ({ page }) => {
    await resetStandaloneDocsStudio(page);
  });

  test('loads full editor with export and JSON controls', async ({ page }) => {
    await expect(page.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Export TSX' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show JSON' })).toBeVisible();
  });

  test('inserts from palette and edits props', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await selectLayer(page, /^Button\b/);
    await inspector(page).getByRole('textbox', { name: 'Text' }).fill('Standalone');

    await expect(page.locator('.demo-button', { hasText: 'Standalone' })).toBeVisible();
  });

  test('undo removes the last insert', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await toolbar(page).getByRole('button', { name: 'Undo' }).click();
    await expect(layers(page).getByRole('button', { name: /^Button\b/ })).toBeHidden();
  });

  test('exports TSX with component imports', async ({ page }) => {
    await bootstrapGridWithButton(page);
    await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();

    const dialog = page.getByRole('dialog', { name: 'Generated TSX' });
    await expect(dialog.locator('pre')).toContainText('import');
    await expect(dialog.locator('pre')).toContainText('Button');
  });
});
