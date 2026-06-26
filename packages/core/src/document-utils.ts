import type { ViewDocument } from './types.js';

/** Compare document tree content, ignoring `meta` and other top-level extras. */
export function documentTreeEqual(a: ViewDocument, b: ViewDocument): boolean {
  return a.version === b.version && JSON.stringify(a.root) === JSON.stringify(b.root);
}
