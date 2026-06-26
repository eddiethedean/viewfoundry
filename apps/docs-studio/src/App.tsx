import { useCallback, useEffect, useState } from 'react';
import { createDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { generateTsx } from '@viewfoundry/codegen';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry, importMap } from '@demo/definitions.js';

const STORAGE_KEY = 'viewfoundry-docs-studio-document';

function loadDocument(): ViewDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ViewDocument;
  } catch {
    // ignore
  }
  return createDocument();
}

export default function App() {
  const [document, setDocument] = useState<ViewDocument>(loadDocument);
  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document]);

  const handleExport = useCallback(() => {
    const { code, warnings } = generateTsx({
      document,
      imports: importMap,
      componentName: 'DocsStudioView',
    });
    setExportedCode(
      warnings.length > 0
        ? `${code}\n// Warnings:\n${warnings.map((w) => `// ${w}`).join('\n')}`
        : code,
    );
    setShowJson(false);
  }, [document]);

  return (
    <div className="docs-studio">
      <ViewFoundryEditor
        registry={demoRegistry}
        document={document}
        onChange={setDocument}
        onExport={handleExport}
        className="docs-studio-editor"
      />
      <div className="docs-studio-drawer-actions">
        <button type="button" onClick={() => setShowJson((v) => !v)}>
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </button>
      </div>
      {showJson && (
        <div className="docs-studio-panel" role="region" aria-label="Document JSON">
          <pre>{JSON.stringify(document, null, 2)}</pre>
        </div>
      )}
      {exportedCode !== null && (
        <div className="docs-studio-panel" role="dialog" aria-label="Generated TSX">
          <div className="docs-studio-panel-header">
            <strong>Generated TSX</strong>
            <button type="button" onClick={() => setExportedCode(null)}>
              Close
            </button>
          </div>
          <pre>{exportedCode}</pre>
        </div>
      )}
    </div>
  );
}
