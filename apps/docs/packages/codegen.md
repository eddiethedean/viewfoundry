# @viewfoundry/codegen

TSX and JSON export for ViewFoundry documents.

```ts
import { generateTsx, generateJson } from '@viewfoundry/codegen';

const { code, warnings } = generateTsx({
  document,
  imports: {
    Button: { importPath: './components', exportName: 'Button' },
  },
  componentName: 'MyView',
});
```

`generateTsx` sanitizes component names, import paths, and prop keys. Unsupported values (functions, invalid identifiers) are omitted with warnings.

Peer dependency: `@viewfoundry/core@^0.2.0`.
