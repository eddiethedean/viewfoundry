import type { HistoryState, ViewDocument } from '@viewfoundry/core';

/** Compare document tree content, ignoring version and top-level meta. */
export function documentTreeEqual(a: ViewDocument, b: ViewDocument): boolean {
  return JSON.stringify(a.root) === JSON.stringify(b.root);
}

/** True when the inbound prop matches the immediate prior snapshot but not the editor present (async parent lag). */
// Intentionally checks only immediate prior history entry — see sync-utils.test.ts (0.4.1 revert behavior).
export function isStaleInboundDocument(
  incoming: ViewDocument,
  present: ViewDocument,
  history: HistoryState,
): boolean {
  if (documentTreeEqual(incoming, present)) return false;
  const incomingRoot = JSON.stringify(incoming.root);
  const presentRoot = JSON.stringify(present.root);
  if (incomingRoot === presentRoot) return false;
  const immediatePrior = history.past[history.past.length - 1];
  if (!immediatePrior) return false;
  return JSON.stringify(immediatePrior.root) === incomingRoot;
}
