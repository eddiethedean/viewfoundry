import { describe, expect, it } from 'vitest';
import { createDocument, createNode } from './document.js';
import { documentTreeEqual } from './document-utils.js';

describe('documentTreeEqual', () => {
  it('ignores meta differences', () => {
    const a = createDocument();
    const b = createDocument({ meta: { name: 'Different' } });
    expect(documentTreeEqual(a, b)).toBe(true);
  });

  it('detects root tree differences', () => {
    const a = createDocument();
    a.root.children = [createNode('Button', {}, [], 'btn1')];
    const b = createDocument();
    expect(documentTreeEqual(a, b)).toBe(false);
  });
});
