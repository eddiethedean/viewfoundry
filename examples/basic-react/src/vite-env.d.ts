declare module 'virtual:viewfoundry/document' {
  import type { ViewDocument } from '@viewfoundry/core';
  const document: ViewDocument;
  export default document;
}

declare module '*?raw' {
  const content: string;
  export default content;
}

interface ImportMeta {
  readonly hot?: {
    accept(
      deps: string,
      callback: (mod: { default: import('@viewfoundry/core').ViewDocument }) => void,
    ): void;
    on(event: 'viewfoundry:document-update', callback: () => void): void;
    on(event: 'viewfoundry:source-update', callback: (data: unknown) => void): void;
  };
}
