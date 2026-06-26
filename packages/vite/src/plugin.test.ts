// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { createDocument, createNode } from '@viewfoundry/core';
import {
  documentModuleSource,
  loadDocumentFromFile,
  RESOLVED_DOCUMENT_ID,
  VIRTUAL_DOCUMENT_ID,
} from './document-module.js';
import { viewfoundry } from './index.js';

describe('loadDocumentFromFile', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  function makeProject(
    document: ReturnType<typeof createDocument>,
    subpath = 'viewfoundry/document.json',
  ) {
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    const fullPath = join(dir, subpath);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(fullPath, JSON.stringify(document, null, 2));
    return { dir, subpath };
  }

  it('loads a valid document', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];
    const { dir, subpath } = makeProject(doc);
    const result = loadDocumentFromFile(dir, subpath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.document.root.children?.[0]?.type).toBe('Button');
    }
  });

  it('reports invalid JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(join(dir, 'viewfoundry/document.json'), '{ not json');
    const result = loadDocumentFromFile(dir, 'viewfoundry/document.json');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Invalid JSON');
    }
  });

  it('reports validation errors', () => {
    const doc = createDocument({ version: '99.0' as '0.1' });
    const { dir, subpath } = makeProject(doc);
    const result = loadDocumentFromFile(dir, subpath);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('Invalid ViewFoundry document');
    }
  });

  it('emits parseable ESM from documentModuleSource', () => {
    const doc = createDocument();
    const source = documentModuleSource(doc);
    expect(source).toContain('export default');
    expect(source).toContain('"version":"0.1"');
  });
});

describe('viewfoundry plugin', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it('resolves and loads the virtual document module', async () => {
    const doc = createDocument();
    doc.root.children = [createNode('Text', { children: 'Hello' }, [], 't1')];
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(join(dir, 'viewfoundry/document.json'), JSON.stringify(doc));

    const { createServer } = await import('vite');
    const server = await createServer({
      root: dir,
      plugins: [viewfoundry()],
      logLevel: 'error',
    });

    try {
      const resolved = await server.pluginContainer.resolveId(VIRTUAL_DOCUMENT_ID, undefined);
      expect(resolved?.id).toBe(RESOLVED_DOCUMENT_ID);

      const loaded = await server.pluginContainer.load(RESOLVED_DOCUMENT_ID);
      expect(loaded).toContain('Hello');
    } finally {
      await server.close();
    }
  });

  it('throws on invalid document during load', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(join(dir, 'viewfoundry/document.json'), JSON.stringify({ version: 'bad' }));

    const { createServer } = await import('vite');
    const server = await createServer({
      root: dir,
      plugins: [viewfoundry()],
      logLevel: 'error',
    });

    try {
      await expect(server.pluginContainer.load(RESOLVED_DOCUMENT_ID)).rejects.toThrow(
        'Invalid ViewFoundry document',
      );
    } finally {
      await server.close();
    }
  });

  it('writes codegen output when configured', async () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Go' }, [], 'b1')];
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(join(dir, 'viewfoundry/document.json'), JSON.stringify(doc));
    writeFileSync(
      join(dir, 'viewfoundry/imports.json'),
      JSON.stringify({
        Button: { importPath: './components', exportName: 'Button' },
      }),
    );

    const { createServer } = await import('vite');
    const server = await createServer({
      root: dir,
      plugins: [
        viewfoundry({
          codegen: {
            output: 'GeneratedView.tsx',
            imports: 'viewfoundry/imports.json',
          },
        }),
      ],
      logLevel: 'error',
    });

    try {
      await server.pluginContainer.load(RESOLVED_DOCUMENT_ID);
      const absolutePath = join(dir, 'viewfoundry/document.json');
      server.watcher.emit('change', absolutePath);
      await new Promise((r) => setTimeout(r, 50));
      const generated = readFileSync(join(dir, 'GeneratedView.tsx'), 'utf-8');
      expect(generated).toContain('export function GeneratedView');
    } finally {
      await server.close();
    }
  });

  it('keeps serving last valid document when save becomes invalid', async () => {
    const doc = createDocument();
    doc.root.children = [createNode('Text', { children: 'Good' }, [], 't1')];
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    const docPath = join(dir, 'viewfoundry/document.json');
    writeFileSync(docPath, JSON.stringify(doc));

    const { createServer } = await import('vite');
    const server = await createServer({
      root: dir,
      plugins: [viewfoundry()],
      logLevel: 'error',
    });

    try {
      const goodLoad = await server.pluginContainer.load(RESOLVED_DOCUMENT_ID);
      expect(goodLoad).toContain('Good');
      writeFileSync(docPath, '{ invalid json');
      server.watcher.emit('change', docPath);
      await new Promise((r) => setTimeout(r, 50));
      const stillGood = await server.pluginContainer.load(RESOLVED_DOCUMENT_ID);
      expect(stillGood).toContain('Good');
    } finally {
      await server.close();
    }
  });

  it('rejects codegen output paths outside project root', async () => {
    const doc = createDocument();
    const dir = mkdtempSync(join(tmpdir(), 'vf-vite-'));
    dirs.push(dir);
    mkdirSync(join(dir, 'viewfoundry'), { recursive: true });
    writeFileSync(join(dir, 'viewfoundry/document.json'), JSON.stringify(doc));

    const { createServer } = await import('vite');
    const server = await createServer({
      root: dir,
      plugins: [
        viewfoundry({
          codegen: { output: '../../../escape.tsx' },
        }),
      ],
      logLevel: 'error',
    });

    try {
      await server.pluginContainer.load(RESOLVED_DOCUMENT_ID);
      server.watcher.emit('change', join(dir, 'viewfoundry/document.json'));
      await new Promise((r) => setTimeout(r, 50));
    } finally {
      await server.close();
    }
  });

  it('escapes U+2028/U+2029 in document module source', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Text', { children: 'line\u2028sep' }, [], 't1')];
    const source = documentModuleSource(doc);
    expect(source).not.toContain('\u2028');
    expect(source).toContain('\\u2028');
  });
});
