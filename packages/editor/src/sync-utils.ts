import type { HistoryState, ViewDocument } from '@viewfoundry/core';

/** Compare document tree content, ignoring `meta` and other top-level extras. */
export function documentTreeEqual(a: ViewDocument, b: ViewDocument): boolean {
  return a.version === b.version && JSON.stringify(a.root) === JSON.stringify(b.root);
}

/** True when the inbound prop matches a past snapshot but not the editor present (async parent lag). */
export function isStaleInboundDocument(
  incoming: ViewDocument,
  present: ViewDocument,
  history: HistoryState,
): boolean {
  if (documentTreeEqual(incoming, present)) return false;
  const incomingRoot = JSON.stringify(incoming.root);
  const presentRoot = JSON.stringify(present.root);
  if (incomingRoot === presentRoot) return false;
  return history.past.some((snapshot) => JSON.stringify(snapshot.root) === incomingRoot);
}
