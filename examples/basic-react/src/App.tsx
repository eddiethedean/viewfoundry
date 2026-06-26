import { useCallback, useEffect, useState } from 'react';
import { createDocument, validateDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { generateTsx } from '@viewfoundry/codegen';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry, importMap, styleTokens } from './definitions.js';

const STORAGE_KEY = 'viewfoundry-basic-react-document';

function loadDocument(): ViewDocument {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ViewDocument;
      const validation = validateDocument(parsed, demoRegistry, { allowMissingComponents: false });
      if (validation.valid) return parsed;
    }
  } catch {
    // ignore
  }
  return createDocument();
}

export default function App() {
  const [document, setDocument] = useState<ViewDocument>(loadDocument);
  const [exportedCode, setExportedCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document]);

  const handleExport = useCallback(() => {
    const { code, warnings } = generateTsx({
      document,
      imports: importMap,
      componentName: 'DemoView',
      styleTokens,
    });
    setExportedCode(
      warnings.length > 0
        ? `${code}\n// Warnings:\n${warnings.map((w) => `// ${w}`).join('\n')}`
        : code,
    );
  }, [document]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ViewFoundry 0.4.0 — Basic React</h1>
      </header>
      <main className="app-main">
        <ViewFoundryEditor
          registry={demoRegistry}
          document={document}
          onChange={setDocument}
          onExport={handleExport}
          styleTokens={styleTokens}
        />
      </main>
      {exportedCode !== null && (
        <div className="export-drawer" role="dialog" aria-label="Generated TSX">
          <div className="export-drawer-header">
            <h2>Generated TSX</h2>
            <button type="button" onClick={() => setExportedCode(null)}>
              Close
            </button>
          </div>
          <pre className="export-drawer-body">{exportedCode}</pre>
        </div>
      )}
    </div>
  );
}
