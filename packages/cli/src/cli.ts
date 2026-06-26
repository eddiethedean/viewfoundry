import { readFileSync, writeFileSync } from 'node:fs';
import { generateTsx } from '@viewfoundry/codegen';
import type { ViewDocument } from '@viewfoundry/core';

export function printHelp() {
  console.log(`viewfoundry v0.2.0

Usage:
  viewfoundry export <input.json> [output.tsx]
  viewfoundry validate <input.json>

Commands:
  export    Generate TSX from a ViewFoundry JSON document
  validate  Check that a JSON file is a valid ViewFoundry document
`);
}

export function loadDocument(path: string): ViewDocument {
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as ViewDocument;
}

export type RunCliResult = {
  exitCode: number;
};

export function runCli(argv: string[]): RunCliResult {
  const [, , command, ...args] = ['node', 'viewfoundry', ...argv];

  switch (command) {
    case 'export': {
      const inputPath = args[0];
      const outputPath = args[1] ?? 'GeneratedView.tsx';
      if (!inputPath) {
        console.error('Error: input JSON path required');
        return { exitCode: 1 };
      }
      const document = loadDocument(inputPath);
      const { code, warnings } = generateTsx({ document, imports: {} });
      writeFileSync(outputPath, code);
      console.log(`Wrote ${outputPath}`);
      for (const w of warnings) console.warn(`Warning: ${w}`);
      return { exitCode: 0 };
    }
    case 'validate': {
      const inputPath = args[0];
      if (!inputPath) {
        console.error('Error: input JSON path required');
        return { exitCode: 1 };
      }
      const document = loadDocument(inputPath);
      if (document.version !== '0.1' || !document.root) {
        console.error('Invalid ViewFoundry document');
        return { exitCode: 1 };
      }
      console.log('Valid ViewFoundry document');
      return { exitCode: 0 };
    }
    case 'init':
      console.log('viewfoundry init is not yet implemented. Use examples/basic-react as a starting point.');
      return { exitCode: 0 };
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
