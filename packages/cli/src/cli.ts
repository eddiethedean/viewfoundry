import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { generateTsx, type ComponentImportMap } from '@viewfoundry/codegen';
import { validateDocument, type ViewDocument } from '@viewfoundry/core';
import { parseInitArgs, printInitNextSteps, runInit } from './init.js';

export function printHelp() {
  console.log(`viewfoundry v0.5.0

Usage:
  viewfoundry init [dir] [--template default|landing-page|dashboard-builder] [--force]
  viewfoundry export <input.json> [output.tsx] [--imports map.json] [--tokens tokens.json] [--strict]
  viewfoundry validate <input.json>

Commands:
  init      Scaffold a new ViewFoundry + Vite + React project
  export    Generate TSX from a ViewFoundry JSON document
  validate  Check that a JSON file is a valid ViewFoundry document

Init options:
  --template   Template to use (default: default)
  --force      Scaffold into a non-empty directory

Options (export):
  --imports   JSON file mapping component types to import paths
  --tokens    JSON file with style token definitions
  --strict    Exit non-zero when export warnings indicate missing imports or unresolved tokens
`);
}

export function loadDocument(path: string): ViewDocument {
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as ViewDocument;
}

export function loadJsonFile<T>(path: string): T {
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as T;
}

export function resolveSafeOutputPath(outputPath: string, cwd = process.cwd()): string | null {
  const resolved = resolve(cwd, outputPath);
  const rel = relative(cwd, resolved);
  if (isAbsolute(rel)) {
    return null;
  }
  if (rel.startsWith('..') || rel.split(sep).includes('..')) {
    return null;
  }
  const cwdWithSep = cwd.endsWith(sep) ? cwd : `${cwd}${sep}`;
  if (!resolved.startsWith(cwdWithSep) && resolved !== cwd) {
    return null;
  }
  return resolved;
}

export function parseExportArgs(args: string[]): {
  inputPath?: string;
  outputPath: string;
  importsPath?: string;
  tokensPath?: string;
  strict: boolean;
} {
  let inputPath: string | undefined;
  let outputPath = 'GeneratedView.tsx';
  let importsPath: string | undefined;
  let tokensPath: string | undefined;
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--strict') {
      strict = true;
      continue;
    }
    if (arg === '--imports') {
      importsPath = args[++i];
      continue;
    }
    if (arg === '--tokens') {
      tokensPath = args[++i];
      continue;
    }
    if (arg.startsWith('-')) {
      continue;
    }
    if (!inputPath) {
      inputPath = arg;
      continue;
    }
    if (!arg.endsWith('.json') && !arg.startsWith('--')) {
      outputPath = arg;
    }
  }

  return { inputPath, outputPath, importsPath, tokensPath, strict };
}

export function isStrictExportWarning(warning: string): boolean {
  return (
    warning.startsWith('Missing import for component type:') ||
    warning.startsWith('Unresolved style token at') ||
    warning.startsWith('Invalid import path for') ||
    warning.startsWith('Invalid export name for')
  );
}

export type RunCliResult = {
  exitCode: number;
};

export function runCli(argv: string[]): RunCliResult {
  const [, , command, ...args] = ['node', 'viewfoundry', ...argv];

  switch (command) {
    case 'export': {
      const { inputPath, outputPath, importsPath, tokensPath, strict } = parseExportArgs(args);
      if (!inputPath) {
        console.error('Error: input JSON path required');
        return { exitCode: 1 };
      }
      const safeOutputPath = resolveSafeOutputPath(outputPath);
      if (!safeOutputPath) {
        console.error('Error: output path must stay within the current working directory');
        return { exitCode: 1 };
      }
      let document: ViewDocument;
      try {
        document = loadDocument(inputPath);
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : 'Failed to read document'}`,
        );
        return { exitCode: 1 };
      }
      let imports: ComponentImportMap = {};
      if (importsPath) {
        try {
          imports = loadJsonFile<ComponentImportMap>(importsPath);
        } catch (error) {
          console.error(
            `Error: ${error instanceof Error ? error.message : 'Failed to read imports file'}`,
          );
          return { exitCode: 1 };
        }
      }
      let styleTokens: Record<string, string | number> | undefined;
      if (tokensPath) {
        try {
          styleTokens = loadJsonFile<Record<string, string | number>>(tokensPath);
        } catch (error) {
          console.error(
            `Error: ${error instanceof Error ? error.message : 'Failed to read tokens file'}`,
          );
          return { exitCode: 1 };
        }
      }
      const validation = validateDocument(document, undefined, { allowMissingComponents: true });
      if (!validation.valid) {
        console.error('Invalid ViewFoundry document:');
        for (const issue of validation.issues) {
          console.error(`  ${issue.path}: ${issue.message}`);
        }
        return { exitCode: 1 };
      }
      const { code, warnings } = generateTsx({ document, imports, styleTokens });
      writeFileSync(safeOutputPath, code);
      console.log(`Wrote ${safeOutputPath}`);
      for (const w of warnings) console.warn(`Warning: ${w}`);
      if (strict && warnings.some(isStrictExportWarning)) {
        return { exitCode: 1 };
      }
      return { exitCode: 0 };
    }
    case 'validate': {
      const inputPath = args[0];
      if (!inputPath) {
        console.error('Error: input JSON path required');
        return { exitCode: 1 };
      }
      let document: ViewDocument;
      try {
        document = loadDocument(inputPath);
      } catch (error) {
        console.error(
          `Error: ${error instanceof Error ? error.message : 'Failed to read document'}`,
        );
        return { exitCode: 1 };
      }
      const validation = validateDocument(document, undefined, { allowMissingComponents: true });
      if (!validation.valid) {
        console.error('Invalid ViewFoundry document:');
        for (const issue of validation.issues) {
          console.error(`  ${issue.path}: ${issue.message}`);
        }
        return { exitCode: 1 };
      }
      console.log('Valid ViewFoundry document');
      return { exitCode: 0 };
    }
    case 'init': {
      try {
        const parsed = parseInitArgs(args);
        const result = runInit({ ...parsed, cwd: process.cwd() });
        if (!result.ok) {
          console.error(`Error: ${result.message}`);
          return { exitCode: 1 };
        }
        printInitNextSteps(parsed.targetDir, parsed.template, process.cwd());
        return { exitCode: 0 };
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : 'Init failed'}`);
        return { exitCode: 1 };
      }
    }
    case '--help':
    case '-h':
    case undefined:
      printHelp();
      return { exitCode: 0 };
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      return { exitCode: 1 };
  }
}
