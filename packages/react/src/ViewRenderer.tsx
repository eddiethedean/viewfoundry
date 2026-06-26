import type { ViewDocument } from '@viewfoundry/core';
import { useViewDocument } from './context.js';
import { ViewNodeRenderer } from './ViewNodeRenderer.js';

export type ViewRendererProps = {
  document?: ViewDocument;
};

export function ViewRenderer({ document }: ViewRendererProps) {
  const contextDoc = useViewDocument();
  const doc = document ?? contextDoc;
  return <ViewNodeRenderer node={doc.root} />;
}
