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

export type ViewFoundryCodegenOptions = {
  output: string;
  imports?: string;
  tokens?: string;
};

export type ViewFoundryViteOptions = {
  /** Path to ViewDocument JSON relative to project root. Default: viewfoundry/document.json */
  document?: string;
  /** Optional: regenerate TSX when the document changes */
  codegen?: ViewFoundryCodegenOptions;
};

export { VIRTUAL_DOCUMENT_ID } from './document-module.js';

function loadJsonFile<T>(root: string, relativePath: string): T {
  const raw = readFileSync(resolve(root, relativePath), 'utf-8');
  return JSON.parse(raw) as T;
}

function runCodegen(
  root: string,
  document: ViewDocument,
  options: ViewFoundryCodegenOptions,
): void {
  const imports = options.imports ? loadJsonFile<ComponentImportMap>(root, options.imports) : {};
  const styleTokens = options.tokens
    ? loadJsonFile<Record<string, string | number>>(root, options.tokens)
    : undefined;
  const { code } = generateTsx({ document, imports, styleTokens });
  writeFileSync(resolve(root, options.output), code);
}

function invalidateDocumentModule(server: ViteDevServer): void {
  const mod = server.moduleGraph.getModuleById(RESOLVED_DOCUMENT_ID);
  if (mod) {
    server.moduleGraph.invalidateModule(mod);
  }
  server.ws.send({ type: 'custom', event: 'viewfoundry:document-update' });
}

/** Vite plugin: load ViewDocument JSON via virtual:viewfoundry/document with HMR. */
export function viewfoundry(options: ViewFoundryViteOptions = {}): Plugin {
  const documentPath = options.document ?? 'viewfoundry/document.json';
  let root = process.cwd();

  const reloadDocument = (server: ViteDevServer) => {
    invalidateDocumentModule(server);
    if (options.codegen) {
      const loaded = loadDocumentFromFile(root, documentPath);
      if (loaded.ok) {
        runCodegen(root, loaded.document, options.codegen);
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
      const loaded = loadDocumentFromFile(root, documentPath);
      if (!loaded.ok) {
        throw new Error(loaded.message);
      }
      return documentModuleSource(loaded.document);
    },
    configureServer(server) {
      const absolutePath = resolve(root, documentPath);
      server.watcher.add(absolutePath);
      server.watcher.on('change', (path) => {
        if (path === absolutePath) {
          reloadDocument(server);
        }
      });
      server.watcher.on('add', (path) => {
        if (path === absolutePath) {
          reloadDocument(server);
        }
      });
    },
  };
}
