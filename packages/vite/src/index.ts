import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { generateTsx, type ComponentImportMap } from '@viewfoundry/codegen';
import type { ViewDocument } from '@viewfoundry/core';
import {
  documentModuleSource,
  loadDocumentFromFile,
  RESOLVED_DOCUMENT_ID,
  VIRTUAL_DOCUMENT_ID,
} from './document-module.js';
import { pathsEqual, resolvePathWithinRoot } from './paths.js';
import { viewfoundryCodeFirst, viewfoundryLocInjection } from './code-first-plugin.js';

export type ViewFoundryCodegenOptions = {
  output: string;
  imports?: string;
  tokens?: string;
};

export { VIRTUAL_DOCUMENT_ID } from './document-module.js';
export {
  VIRTUAL_BOARDS_ID,
  viewfoundryCodeFirst,
  viewfoundryLocInjection,
  type CodeFirstPluginOptions,
} from './code-first-plugin.js';

export type ViewFoundryViteMode = 'embed' | 'code-first';

export type ViewFoundryViteOptions = {
  /** Editing mode. Default: embed */
  mode?: ViewFoundryViteMode;
  /** Path to ViewDocument JSON relative to project root. Default: viewfoundry/document.json */
  document?: string;
  /** Optional: regenerate TSX when the document changes */
  codegen?: ViewFoundryCodegenOptions;
  /** Glob for board files when mode is code-first */
  boards?: string;
};

/** Unified plugin: embed document HMR and/or code-first boards + loc injection. */
export function viewfoundryAll(options: ViewFoundryViteOptions = {}): Plugin[] {
  const mode = options.mode ?? 'embed';
  const plugins: Plugin[] = [];
  if (mode === 'embed' || !options.mode) {
    plugins.push(viewfoundry(options));
  }
  if (mode === 'code-first') {
    plugins.push(viewfoundryCodeFirst({ boards: options.boards }));
    plugins.push(viewfoundryLocInjection());
  }
  return plugins;
}

function loadJsonFile<T>(root: string, relativePath: string): T {
  const absolutePath = resolvePathWithinRoot(root, relativePath);
  if (!absolutePath) {
    throw new Error(`Path must stay within the project root: ${relativePath}`);
  }
  const raw = readFileSync(absolutePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function runCodegen(
  root: string,
  document: ViewDocument,
  options: ViewFoundryCodegenOptions,
): void {
  const outputPath = resolvePathWithinRoot(root, options.output);
  if (!outputPath) {
    throw new Error(`Codegen output path must stay within the project root: ${options.output}`);
  }
  const imports = options.imports ? loadJsonFile<ComponentImportMap>(root, options.imports) : {};
  const styleTokens = options.tokens
    ? loadJsonFile<Record<string, string | number>>(root, options.tokens)
    : undefined;
  const { code } = generateTsx({ document, imports, styleTokens });
  writeFileSync(outputPath, code);
}

function invalidateDocumentModule(server: ViteDevServer): void {
  const mod = server.moduleGraph.getModuleById(RESOLVED_DOCUMENT_ID);
  if (mod) {
    server.moduleGraph.invalidateModule(mod);
  }
  server.ws.send({ type: 'custom', event: 'viewfoundry:document-update' });
}

function sendDocumentError(server: ViteDevServer, message: string): void {
  server.ws.send({ type: 'custom', event: 'viewfoundry:document-error', data: { message } });
}

/** Vite plugin: load ViewDocument JSON via virtual:viewfoundry/document with HMR. */
export function viewfoundry(options: ViewFoundryViteOptions = {}): Plugin {
  const documentPath = options.document ?? 'viewfoundry/document.json';
  let root = process.cwd();
  let cachedDocument: ViewDocument | null = null;

  const getWatchedAbsolutePaths = (): string[] => {
    const paths: string[] = [];
    const doc = resolvePathWithinRoot(root, documentPath);
    if (doc) paths.push(doc);
    if (options.codegen?.imports) {
      const p = resolvePathWithinRoot(root, options.codegen.imports);
      if (p) paths.push(p);
    }
    if (options.codegen?.tokens) {
      const p = resolvePathWithinRoot(root, options.codegen.tokens);
      if (p) paths.push(p);
    }
    return paths;
  };

  const isWatchedPath = (path: string): boolean => {
    const normalized = resolve(path);
    return getWatchedAbsolutePaths().some((w) => pathsEqual(normalized, w));
  };

  const reloadDocument = (server: ViteDevServer, invalidate = true) => {
    const loaded = loadDocumentFromFile(root, documentPath);
    if (!loaded.ok) {
      sendDocumentError(server, loaded.message);
      return;
    }
    cachedDocument = loaded.document;
    if (invalidate) {
      invalidateDocumentModule(server);
    }
    if (options.codegen) {
      try {
        runCodegen(root, loaded.document, options.codegen);
      } catch (error) {
        sendDocumentError(server, error instanceof Error ? error.message : 'Codegen failed');
      }
    }
  };

  return {
    name: 'viewfoundry',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_DOCUMENT_ID) {
        return RESOLVED_DOCUMENT_ID;
      }
      return undefined;
    },
    load(id) {
      if (id !== RESOLVED_DOCUMENT_ID) {
        return undefined;
      }
      if (cachedDocument) {
        return documentModuleSource(cachedDocument);
      }
      const loaded = loadDocumentFromFile(root, documentPath);
      if (!loaded.ok) {
        throw new Error(loaded.message);
      }
      cachedDocument = loaded.document;
      return documentModuleSource(loaded.document);
    },
    configureServer(server) {
      for (const path of getWatchedAbsolutePaths()) {
        server.watcher.add(path);
      }
      const onWatch = (path: string) => {
        if (!isWatchedPath(path)) return;
        const docPath = resolvePathWithinRoot(root, documentPath);
        const normalized = resolve(path);
        const invalidate = docPath ? pathsEqual(normalized, docPath) : true;
        reloadDocument(server, invalidate);
      };
      server.watcher.on('change', onWatch);
      server.watcher.on('add', onWatch);
      server.watcher.on('unlink', (path) => {
        const docPath = resolvePathWithinRoot(root, documentPath);
        if (docPath && pathsEqual(resolve(path), docPath)) {
          sendDocumentError(server, `ViewFoundry document removed: ${documentPath}`);
        }
      });
    },
  };
}
