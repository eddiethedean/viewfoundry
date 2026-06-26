import { expect, type Locator, type Page } from '@playwright/test';

export const STORAGE_KEY = 'viewfoundry-basic-react-document';

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
        children?: Array<{ id: string; type: string; props?: Record<string, unknown> }>;
      }>;
    }>;
  };
};

export async function resetDocument(page: Page) {
  await page.goto('/');
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload();
  await expect(toolbar(page).getByRole('button', { name: 'Edit', pressed: true })).toBeVisible();
}

export function toolbar(page: Page) {
  return page.locator('.vf-toolbar');
}

export function palette(page: Page) {
  return page.locator('.vf-palette');
}

export function layers(page: Page) {
  return page.locator('.vf-layers');
}

export function inspector(page: Page) {
  return page.locator('.vf-inspector');
}

export function canvas(page: Page) {
  return page.locator('.vf-canvas');
}

export function demoButton(page: Page, label: string) {
  return page.locator('.vf-canvas .demo-button', { hasText: label });
}

export async function insertFromPalette(page: Page, componentName: string) {
  await palette(page).getByRole('button', { name: componentName, exact: true }).click();
}

export async function getStoredDocument(page: Page): Promise<StoredDocument | null> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as StoredDocument;
}

export async function expectStoredDocument(
  page: Page,
  check: (doc: StoredDocument) => boolean,
  message?: string,
) {
  await expect
    .poll(async () => {
      const doc = await getStoredDocument(page);
      return doc !== null && check(doc);
    }, message)
    .toBe(true);
}

export function layerButton(page: Page, pattern: RegExp | string) {
  return layers(page).getByRole('button', { name: pattern });
}

export async function selectLayer(page: Page, pattern: RegExp | string) {
  await layerButton(page, pattern).first().click();
}

export async function selectCanvasNode(page: Page, componentType: string) {
  await canvas(page)
    .locator(`.vf-node-wrapper[data-component-type="${componentType}"]`)
    .first()
    .click({ force: true });
}

export async function bootstrapGridWithButton(page: Page) {
  await insertFromPalette(page, 'Button');
  await expect(layerButton(page, /^Button\b/)).toBeVisible();
  await expect(layerButton(page, /^Grid\b/)).toBeVisible();
}

export function firstGridChild(doc: StoredDocument) {
  return doc.root.children?.[0]?.children?.[0];
}

export async function setStudioMode(page: Page, mode: 'Edit' | 'Live') {
  await toolbar(page).getByRole('button', { name: mode, exact: true }).click();
}

export async function expectInspectorShowsType(inspectorPanel: Locator, type: string) {
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
