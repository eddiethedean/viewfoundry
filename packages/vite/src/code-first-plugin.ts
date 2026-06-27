import type { Plugin, ViteDevServer } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import type { BoardCatalogEntry } from '@viewfoundry/board';

export const VIRTUAL_BOARDS_ID = 'virtual:viewfoundry/boards';
export const RESOLVED_BOARDS_ID = '\0viewfoundry:boards';

export function boardsModuleSource(entries: BoardCatalogEntry[]): string {
  const json = JSON.stringify(entries)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `export default ${json};\n`;
}

export type CodeFirstPluginOptions = {
  /** Glob for board modules relative to project root */
  boards?: string;
};

function escapeAttrValue(value: string): string {
  return value.replace(/"/g, '&quot;');
}

export function viewfoundryCodeFirst(options: CodeFirstPluginOptions = {}): Plugin {
  const boardsGlob = options.boards ?? 'src/**/*.board.tsx';
  let catalog: BoardCatalogEntry[] = [];
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    name: 'viewfoundry-code-first',
    configResolved(config) {
      void config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_BOARDS_ID) return RESOLVED_BOARDS_ID;
    },
    load(id) {
      if (id === RESOLVED_BOARDS_ID) {
        return boardsModuleSource(catalog);
      }
    },
    configureServer(server) {
      const refreshBoards = async () => {
        catalog = discoverBoards(server, boardsGlob);
        const mod = server.moduleGraph.getModuleById(RESOLVED_BOARDS_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({
          type: 'custom',
          event: 'viewfoundry:source-update',
          data: { boards: catalog },
        });
      };

      const debouncedRefresh = () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
          refreshTimer = null;
          void refreshBoards();
        }, 100);
      };

      refreshBoards();
      server.watcher.on('add', debouncedRefresh);
      server.watcher.on('unlink', debouncedRefresh);
      server.watcher.on('change', debouncedRefresh);
    },
  };
}

function discoverBoards(server: ViteDevServer, _pattern: string): BoardCatalogEntry[] {
  const root = server.config.root;
  const files = findBoardFiles(root, '.board.tsx');
  return files.map((file) => {
    const rel = relative(root, file).replace(/\\/g, '/');
    const name = rel.replace(/^.*\//, '').replace(/\.board\.tsx$/, '');
    return { id: rel, name, moduleId: `/${rel}`, sourceFile: rel };
  });
}

function findBoardFiles(dir: string, suffix: string, results: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      findBoardFiles(full, suffix, results);
    } else if (entry.endsWith(suffix)) {
      results.push(full);
    }
  }
  return results;
}

/** Inject data-vf-element-id on JSX opening elements in dev (code-first selection). */
export function viewfoundryLocInjection(): Plugin {
  let projectRoot = process.cwd();

  return {
    name: 'viewfoundry-loc-injection',
    enforce: 'pre',
    configResolved(config) {
      projectRoot = config.root;
    },
    transform(code, id) {
      if (!/\.(tsx|jsx)$/.test(id)) return null;
      if (id.includes('node_modules')) return null;
      if (!code.includes('<')) return null;

      const relFile = relative(projectRoot, id).replace(/\\/g, '/');
      const sourceFile = ts.createSourceFile(
        relFile,
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const edits: { pos: number; text: string }[] = [];

      function visit(node: ts.Node) {
        if (ts.isJsxSelfClosingElement(node)) {
          const start = node.getStart(sourceFile);
          const elementId = escapeAttrValue(`${relFile}:${start}`);
          const insertAt = node.tagName.getEnd();
          edits.push({ pos: insertAt, text: ` data-vf-element-id="${elementId}"` });
        } else if (ts.isJsxOpeningElement(node)) {
          const start = node.getStart(sourceFile);
          const elementId = escapeAttrValue(`${relFile}:${start}`);
          const insertAt = node.tagName.getEnd();
          edits.push({ pos: insertAt, text: ` data-vf-element-id="${elementId}"` });
        }
        ts.forEachChild(node, visit);
      }

      visit(sourceFile);
      if (edits.length === 0) return null;

      edits.sort((a, b) => b.pos - a.pos);
      let next = code;
      for (const edit of edits) {
        next = next.slice(0, edit.pos) + edit.text + next.slice(edit.pos);
      }
      return { code: next, map: null };
    },
  };
}
