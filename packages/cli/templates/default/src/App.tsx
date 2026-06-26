import { useCallback, useEffect, useState } from 'react';
import { createDocument, validateDocument } from '@viewfoundry/core';
import type { ViewDocument } from '@viewfoundry/core';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { generateTsx } from '@viewfoundry/codegen';
import seedDocument from 'virtual:viewfoundry/document';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry, importMap, styleTokens } from './definitions.js';

const STORAGE_KEY = 'viewfoundry-basic-react-document';

type LoadResult =
  | { ok: true; document: ViewDocument }
  | { ok: false; message: string; raw?: string };

function loadPersistedDocument(fallback: ViewDocument): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ViewDocument;
      const validation = validateDocument(parsed, demoRegistry, { allowMissingComponents: false });
      if (validation.valid) return { ok: true, document: parsed };
      const firstIssue = validation.issues[0];
      return {
        ok: false,
        message: firstIssue
          ? `Saved document could not be loaded: ${firstIssue.message}`
          : 'Saved document could not be loaded.',
        raw,
      };
    }
  } catch {
    const raw = localStorage.getItem(STORAGE_KEY) ?? undefined;
    return {
      ok: false,
      message: 'Saved document could not be loaded: invalid JSON.',
      raw,
    };
  }
  return { ok: true, document: fallback };
}

export default function App() {
  const initialLoad = loadPersistedDocument(seedDocument);
  const [document, setDocument] = useState<ViewDocument>(
    initialLoad.ok ? initialLoad.document : createDocument(),
  );
  const [loadWarning, setLoadWarning] = useState<string | null>(
    initialLoad.ok ? null : initialLoad.message,
  );
  const [exportedCode, setExportedCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
  }, [document]);

  useEffect(() => {
    if (!import.meta.hot) return;

    const applySeedDocument = (next: ViewDocument) => {
      setDocument(next);
      setLoadWarning(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    import.meta.hot.accept('virtual:viewfoundry/document', (mod) => {
      if (mod?.default) {
        applySeedDocument(mod.default);
      }
    });

    import.meta.hot.on('viewfoundry:document-update', async () => {
      const mod = await import('virtual:viewfoundry/document');
      applySeedDocument(mod.default);
    });
  }, []);

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

  const dismissLoadWarning = () => setLoadWarning(null);

  const resetDocument = () => {
    setDocument(seedDocument);
    setLoadWarning(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ViewFoundry {{ VERSION }} — Basic React</h1>
      </header>
      {loadWarning && (
        <div className="load-warning" role="alert" data-testid="load-warning">
          <p>{loadWarning}</p>
          <div className="load-warning-actions">
            <button type="button" onClick={dismissLoadWarning}>
              Dismiss
            </button>
            <button type="button" onClick={resetDocument}>
              Reset to seed document
            </button>
          </div>
        </div>
      )}
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
