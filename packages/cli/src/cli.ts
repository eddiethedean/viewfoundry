import { readFileSync, writeFileSync } from 'node:fs';
import { generateTsx } from '@viewfoundry/codegen';
import { validateDocument, type ViewDocument } from '@viewfoundry/core';

export function printHelp() {
  console.log(`viewfoundry v0.4.0

Usage:
  viewfoundry export <input.json> [output.tsx]
  viewfoundry validate <input.json>
  viewfoundry init

Commands:
  export    Generate TSX from a ViewFoundry JSON document
  validate  Check that a JSON file is a valid ViewFoundry document
  init      Print guidance for starting a new project (stub until v0.5.0)
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
    case 'init':
      console.log(
        'viewfoundry init is not yet implemented. Use examples/basic-react as a starting point.',
      );
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
