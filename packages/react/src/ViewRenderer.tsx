import type { ViewDocument } from '@viewfoundry/core';
import { useViewDocument } from './context.js';
import { ViewNodeRenderer } from './ViewNodeRenderer.js';

export type ViewRendererProps = {
  /** When omitted, uses the document from `ViewFoundryProvider`. */
  document?: ViewDocument;
};

/**
 * Renders a ViewFoundry document tree. Requires `ViewFoundryProvider` above this component
 * (even when `document` is passed — the provider supplies registry, mode, and selection).
 */
export function ViewRenderer({ document }: ViewRendererProps) {
  const contextDoc = useViewDocument();
  const doc = document ?? contextDoc;
  return <ViewNodeRenderer node={doc.root} />;
}
