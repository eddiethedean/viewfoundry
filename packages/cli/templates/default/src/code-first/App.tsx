import { useCallback, useEffect, useState } from 'react';
import { ViewFoundryEditor } from '@viewfoundry/editor';
import { createBoard } from '@viewfoundry/board';
import { ButtonFixture } from './fixture.js';
import fixtureSource from './fixture.tsx?raw';
import '@viewfoundry/editor/styles.css';
import '@viewfoundry/react/styles.css';
import { demoRegistry } from '../definitions.js';

const SOURCE_FILE = 'src/code-first/fixture.tsx';

const board = createBoard({
  name: 'Button',
  component: ButtonFixture,
  props: {},
  sourceFile: SOURCE_FILE,
  viewport: { width: 360, height: 200 },
});

export default function CodeFirstApp() {
  const [sourceFiles, setSourceFiles] = useState<Record<string, string>>({
    [SOURCE_FILE]: fixtureSource,
  });

  useEffect(() => {
    if (!import.meta.hot) return;

    const reloadFixture = async () => {
      const mod = await import('./fixture.tsx?raw');
      setSourceFiles((prev) => ({ ...prev, [SOURCE_FILE]: mod.default }));
    };

    import.meta.hot.on('viewfoundry:source-update', () => {
      void reloadFixture();
    });
  }, []);

  const handleSourceChange = useCallback((files: Record<string, string>) => {
    setSourceFiles({ ...files });
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ViewFoundry 0.7.0 — Code-first Board</h1>
      </header>
      <main className="app-main">
        <ViewFoundryEditor
          mode="code-first"
          registry={demoRegistry}
          board={board}
          sourceFiles={sourceFiles}
          activeSourceFile={SOURCE_FILE}
          onSourceFilesChange={handleSourceChange}
        />
      </main>
      <pre data-testid="source-content" hidden aria-hidden="true">
        {sourceFiles[SOURCE_FILE]}
      </pre>
    </div>
  );
}
