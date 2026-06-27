import { expect, test } from '@playwright/test';
import {
  countLayers,
  countNodesOfType,
  dragFromPaletteToCanvas,
  expectStoredDocument,
  insertFromPalette,
  resetDocument,
} from './helpers.js';

test.describe('drag and drop', () => {
  test.beforeEach(async ({ page }) => {
    await resetDocument(page);
  });

  test('bootstraps grid when dragging Button onto empty canvas', async ({ page }) => {
    await dragFromPaletteToCanvas(page, page, 'Button');
    await expect(countLayers(page, /^Grid\b/)).toBeVisible();
    await expect(countLayers(page, /^Button\b/)).toBeVisible();
  });

  test('inserts a second Button by dragging onto the grid', async ({ page }) => {
    await dragFromPaletteToCanvas(page, page, 'Button');
    await dragFromPaletteToCanvas(page, page, 'Button');
    await expect(countLayers(page, /^Button\b/)).toHaveCount(2);
  });

  test('can still click-insert after multiple drags', async ({ page }) => {
    await dragFromPaletteToCanvas(page, page, 'Button');
    await dragFromPaletteToCanvas(page, page, 'Button');
    await insertFromPalette(page, 'Heading');
    await expect(countLayers(page, /^Heading\b/)).toBeVisible();
  });

  test('assigns grid placement metadata to dragged siblings', async ({ page }) => {
    await dragFromPaletteToCanvas(page, page, 'Button');
    await dragFromPaletteToCanvas(page, page, 'Button');
    await expect(countLayers(page, /^Button\b/)).toHaveCount(2);
    await expect(countLayers(page, /^Button\b/).first()).toContainText(/r\d+c\d+/);
    await expectStoredDocument(page, (doc) => {
      const children = doc.root.children?.[0]?.children ?? [];
      return children.length === 2 && children.every((child) => child.layout?.grid !== undefined);
    });
  });

  test('dragging Card onto empty canvas creates layout root', async ({ page }) => {
    await dragFromPaletteToCanvas(page, page, 'Card');
    await expect(countLayers(page, /^Card\b/)).toBeVisible();
    await expectStoredDocument(page, (doc) => countNodesOfType(doc, 'Card') === 1);
  });
});
