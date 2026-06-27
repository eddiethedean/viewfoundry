import { expect, type FrameLocator, type Page } from '@playwright/test';

export const STORAGE_KEY = 'viewfoundry-basic-react-document';
export const DOCS_STUDIO_STORAGE_KEY = 'viewfoundry-docs-studio-document';
export const THEME_STORAGE_KEY = 'viewfoundry-editor-theme';
export const MOD_KEY = 'ControlOrMeta';

/** All demo palette component names in the basic-react example. */
export const PALETTE_COMPONENTS = [
  'Button',
  'Card',
  'Stack',
  'Grid',
  'Row',
  'Heading',
  'Text',
] as const;

export type PaletteComponent = (typeof PALETTE_COMPONENTS)[number];

/** Page or iframe frame — both support Playwright locator APIs used here. */
export type EditorContext = Page | FrameLocator;

export type StoredDocument = {
  version: string;
  root: {
    children?: Array<{
      id: string;
      type: string;
      children?: Array<{
        id: string;
        type: string;
        props?: Record<string, unknown>;
        layout?: { grid?: { column?: number; row?: number } };
        style?: Record<string, string | number>;
        children?: Array<{ id: string; type: string; props?: Record<string, unknown> }>;
      }>;
    }>;
  };
};

export function docsStudioFrame(page: Page): FrameLocator {
  return page.frameLocator('#viewfoundry-studio-embed');
}

export async function resetDocument(page: Page) {
  await page.goto('/');
  await page.evaluate(
    (keys) => {
      for (const key of keys) localStorage.removeItem(key);
    },
    [STORAGE_KEY, THEME_STORAGE_KEY],
  );
  await page.reload();
  await expect(toolbar(page).getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
}

export async function resetTheme(page: Page, theme: 'dark' | 'light' = 'dark') {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
    key: THEME_STORAGE_KEY,
    value: theme,
  });
  await page.reload();
  await expect(page.locator('.vf-editor')).toHaveAttribute('data-vf-theme', theme);
}

export async function resetDocsStudioEmbedded(page: Page) {
  await page.goto('/studio.html');
  await page.evaluate((key) => localStorage.removeItem(key), DOCS_STUDIO_STORAGE_KEY);
  await page.reload();
  await expect(docsStudioFrame(page).locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
}

export async function resetStandaloneDocsStudio(page: Page) {
  await page.goto('/_static/studio/index.html');
  await page.evaluate((key) => localStorage.removeItem(key), DOCS_STUDIO_STORAGE_KEY);
  await page.reload();
  await expect(page.locator('.vf-editor')).toBeVisible({ timeout: 15_000 });
}

export function toolbar(ctx: EditorContext) {
  return ctx.locator('.vf-toolbar');
}

export function toolbarError(ctx: EditorContext) {
  return ctx.locator('.vf-toolbar-error');
}

export function palette(ctx: EditorContext) {
  return ctx.locator('.vf-palette');
}

export function layers(ctx: EditorContext) {
  return ctx.locator('.vf-layers');
}

export function inspector(ctx: EditorContext) {
  return ctx.locator('.vf-inspector');
}

export function canvas(ctx: EditorContext) {
  return ctx.locator('.vf-canvas');
}

export function demoButton(ctx: EditorContext, label: string) {
  return ctx.locator('.vf-canvas .demo-button', { hasText: label });
}

export async function insertFromPalette(ctx: EditorContext, componentName: string) {
  await palette(ctx).getByRole('button', { name: componentName, exact: true }).click();
}

export async function dragFromPaletteToCanvas(
  page: Page,
  ctx: EditorContext,
  componentName: string,
) {
  const source = palette(ctx).getByRole('button', { name: componentName, exact: true });
  const sourceBox = await source.boundingBox();
  if (!sourceBox) {
    throw new Error('Could not resolve drag source');
  }

  const dropZone = ctx.locator('[data-testid="vf-canvas-drop-zone"]');
  const isEmpty = await dropZone.evaluate((el) =>
    el.classList.contains('vf-canvas-drop-zone--empty'),
  );

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2 + 20,
    {
      steps: 6,
    },
  );

  let targetX: number;
  let targetY: number;

  if (isEmpty) {
    const targetBox = await dropZone.boundingBox();
    if (!targetBox) throw new Error('Could not resolve canvas drop target');
    targetX = targetBox.x + targetBox.width / 2;
    targetY = targetBox.y + targetBox.height / 2;
  } else {
    const cell = ctx.locator('[data-grid-row="1"][data-grid-column="2"]').first();
    const cellBox = await cell.boundingBox();
    if (cellBox) {
      targetX = cellBox.x + cellBox.width / 2;
      targetY = cellBox.y + cellBox.height / 2;
    } else {
      const grid = ctx.locator('.vf-canvas .demo-grid').first();
      const gridBox = await grid.boundingBox();
      if (!gridBox) throw new Error('Could not resolve grid target');
      targetX = gridBox.x + gridBox.width * 0.75;
      targetY = gridBox.y + gridBox.height * 0.5;
    }
  }

  await page.mouse.move(targetX, targetY, { steps: 12 });
  await page.mouse.up();
  await page.waitForFunction(() => !document.querySelector('[data-dnd-kit-drag-overlay]'));
}

export async function dragFromPaletteToGridCell(
  page: Page,
  ctx: EditorContext,
  componentName: string,
  row: number,
  column: number,
) {
  const source = palette(ctx).getByRole('button', { name: componentName, exact: true });
  const sourceBox = await source.boundingBox();
  if (!sourceBox) {
    throw new Error('Could not resolve drag source');
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2 + 20,
    {
      steps: 6,
    },
  );

  const target = ctx.locator(`[data-grid-row="${row}"][data-grid-column="${column}"]`).first();
  const targetBox = await target.boundingBox();
  if (!targetBox) {
    throw new Error('Could not resolve grid cell target');
  }

  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 12,
  });
  await page.mouse.up();
  await page.waitForFunction(() => !document.querySelector('[data-dnd-kit-drag-overlay]'));
}

export async function clearPaletteSearch(ctx: EditorContext) {
  await palette(ctx).getByPlaceholder('Search components...').fill('');
}

export async function exportTsx(page: Page) {
  await toolbar(page).getByRole('button', { name: 'Export TSX' }).click();
  const drawer = page.getByRole('dialog', { name: 'Generated TSX' });
  await expect(drawer).toBeVisible();
  return drawer;
}

export async function closeExportDrawer(page: Page) {
  await page
    .getByRole('dialog', { name: 'Generated TSX' })
    .getByRole('button', { name: 'Close' })
    .click();
  await expect(page.getByRole('dialog', { name: 'Generated TSX' })).toBeHidden();
}

export function countLayers(ctx: EditorContext, pattern: RegExp) {
  return layers(ctx).getByRole('button', { name: pattern });
}

export async function insertIntoSelectedContainer(
  ctx: EditorContext,
  container: string,
  child: string,
) {
  await insertFromPalette(ctx, container);
  await selectLayer(ctx, new RegExp(`^${container}\\b`));
  await insertFromPalette(ctx, child);
}

export async function nudgeGridOnPage(
  page: Page,
  direction: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown',
) {
  await page.keyboard.press(direction);
}

export function gridChildCount(doc: StoredDocument, gridIndex = 0) {
  return doc.root.children?.[gridIndex]?.children?.length ?? 0;
}

export function countNodesOfType(doc: StoredDocument, type: string): number {
  let count = 0;
  function walk(node: { type: string; children?: Array<{ type: string; children?: unknown[] }> }) {
    if (node.type === type) count++;
    for (const child of node.children ?? []) walk(child);
  }
  for (const child of doc.root.children ?? []) walk(child);
  return count;
}

export async function getStoredDocument(
  page: Page,
  key: string = STORAGE_KEY,
): Promise<StoredDocument | null> {
  const raw = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  if (!raw) return null;
  return JSON.parse(raw) as StoredDocument;
}

export async function expectStoredDocument(
  page: Page,
  check: (doc: StoredDocument) => boolean,
  message?: string,
  key: string = STORAGE_KEY,
) {
  await expect
    .poll(async () => {
      const doc = await getStoredDocument(page, key);
      return doc !== null && check(doc);
    }, message)
    .toBe(true);
}

export function layerButton(ctx: EditorContext, pattern: RegExp | string) {
  return layers(ctx).getByRole('button', { name: pattern });
}

export async function selectLayer(ctx: EditorContext, pattern: RegExp | string) {
  await layerButton(ctx, pattern).first().click();
}

export async function selectCanvasNode(ctx: EditorContext, componentType: string) {
  await canvas(ctx)
    .locator(`.vf-node-wrapper[data-component-type="${componentType}"]`)
    .first()
    .click({ force: true });
}

export async function bootstrapGridWithButton(ctx: EditorContext) {
  await insertFromPalette(ctx, 'Button');
  await expect(layerButton(ctx, /^Button\b/)).toBeVisible();
  await expect(layerButton(ctx, /^Grid\b/)).toBeVisible();
}

export function styleInspector(ctx: EditorContext) {
  return ctx.locator('.vf-style-inspector');
}

export async function setEditSubMode(ctx: EditorContext, mode: 'Component' | 'Style') {
  await toolbar(ctx).getByRole('button', { name: mode, exact: true }).click();
}

export async function setShowGrid(ctx: EditorContext, enabled: boolean) {
  const toggle = toolbar(ctx).getByRole('button', { name: 'Show Grid' });
  const pressed = await toggle.getAttribute('aria-pressed');
  if ((pressed === 'true') !== enabled) {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-pressed', enabled ? 'true' : 'false');
}

export function nodeActions(ctx: EditorContext) {
  return ctx.locator('.vf-node-actions');
}

export async function removeSelectedNode(ctx: EditorContext, componentName?: string) {
  const name = componentName ? `Remove ${componentName} from canvas` : /Remove .+ from canvas/;
  await nodeActions(ctx).getByRole('button', { name }).click();
}

export async function removeLayer(ctx: EditorContext, layerPattern: RegExp | string) {
  const row = layers(ctx)
    .locator('.vf-layer-row')
    .filter({
      has: layers(ctx).getByRole('button', { name: layerPattern }),
    });
  await row.getByRole('button', { name: /from layers$/ }).click();
}

export function firstGridChild(doc: StoredDocument) {
  return doc.root.children?.[0]?.children?.[0];
}

export async function setStudioMode(ctx: EditorContext, mode: 'Edit' | 'Live') {
  await toolbar(ctx).getByRole('button', { name: mode, exact: true }).click();
}

export async function expectInspectorShowsType(
  inspectorPanel: ReturnType<typeof inspector>,
  type: string,
) {
  await expect(inspectorPanel.locator('.vf-inspector-meta')).toContainText(type);
}

export function findNodeByType(
  doc: StoredDocument,
  type: string,
): { id: string; type: string; children?: unknown[] } | undefined {
  function walk(node: {
    id: string;
    type: string;
    children?: Array<{ id: string; type: string; children?: unknown[] }>;
  }): { id: string; type: string; children?: unknown[] } | undefined {
    if (node.type === type) return node;
    for (const child of node.children ?? []) {
      const found = walk(child);
      if (found) return found;
    }
    return undefined;
  }
  for (const child of doc.root.children ?? []) {
    const found = walk(child);
    if (found) return found;
  }
  return undefined;
}

/** Dispatch a keyboard shortcut to the editor without clearing the current selection. */
export async function pressEditorShortcut(page: Page, ctx: EditorContext, shortcut: string) {
  if (ctx !== page) {
    await ctx.locator('.vf-editor-body').press(shortcut);
  } else {
    await page.keyboard.press(shortcut);
  }
}
