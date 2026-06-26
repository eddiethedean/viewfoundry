declare module 'virtual:viewfoundry/document' {
  import type { ViewDocument } from '@viewfoundry/core';
  const document: ViewDocument;
  export default document;
}

interface ImportMeta {
  readonly hot?: {
    accept(
      deps: string,
      callback: (mod: { default: import('@viewfoundry/core').ViewDocument }) => void,
    ): void;
    on(event: 'viewfoundry:document-update', callback: () => void): void;
  };
}
