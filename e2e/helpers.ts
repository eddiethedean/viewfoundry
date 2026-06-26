import { expect, type FrameLocator, type Page } from '@playwright/test';

export const STORAGE_KEY = 'viewfoundry-basic-react-document';
export const DOCS_STUDIO_STORAGE_KEY = 'viewfoundry-docs-studio-document';
export const MOD_KEY = 'ControlOrMeta';

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
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(toolbar(page).getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
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
