import { useCallback, useEffect, useState } from 'react';
import { createDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { ViewFoundryProvider, ViewRenderer } from '@viewfoundry/react';
import { generateTsx } from '@viewfoundry/codegen';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry, importMap } from './definitions.js';

const STORAGE_KEY = 'viewfoundry-basic-react-document';

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
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [exportedCode, setExportedCode] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document]);

  const handleExport = useCallback(() => {
    const { code, warnings } = generateTsx({
      document,
      imports: importMap,
      componentName: 'DemoView',
    });
    setExportedCode(
      warnings.length > 0 ? `${code}\n// Warnings:\n${warnings.map((w) => `// ${w}`).join('\n')}` : code,
    );
    setMode('preview');
  }, [document]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ViewFoundry 0.1.0 — Basic React</h1>
        <div className="app-tabs">
          <button
            type="button"
            className={mode === 'edit' ? 'active' : ''}
            onClick={() => setMode('edit')}
          >
            Editor
          </button>
          <button
            type="button"
            className={mode === 'preview' ? 'active' : ''}
            onClick={() => setMode('preview')}
          >
            Preview
          </button>
        </div>
      </header>
      <main className="app-main">
        {mode === 'edit' ? (
          <div className="app-editor">
            <ViewFoundryEditor
              registry={demoRegistry}
              document={document}
              onChange={setDocument}
              onExport={handleExport}
            />
          </div>
        ) : (
          <div className="app-preview">
            <div className="preview-surface">
              <ViewFoundryProvider document={document} registry={demoRegistry} mode="preview">
                <ViewRenderer />
              </ViewFoundryProvider>
            </div>
            {exportedCode && (
              <div className="export-panel">
                <h3>Generated TSX</h3>
                <pre>{exportedCode}</pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
