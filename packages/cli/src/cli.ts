#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { generateTsx } from '@viewfoundry/codegen';
import type { ViewDocument } from '@viewfoundry/core';

const [, , command, ...args] = process.argv;

function printHelp() {
  console.log(`viewfoundry v0.1.0

Usage:
  viewfoundry export <input.json> [output.tsx]
  viewfoundry validate <input.json>

Commands:
  export    Generate TSX from a ViewFoundry JSON document
  validate  Check that a JSON file is a valid ViewFoundry document
`);
}

function loadDocument(path: string): ViewDocument {
  const raw = readFileSync(path, 'utf-8');
  return JSON.parse(raw) as ViewDocument;
}

switch (command) {
  case 'export': {
    const inputPath = args[0];
    const outputPath = args[1] ?? 'GeneratedView.tsx';
    if (!inputPath) {
      console.error('Error: input JSON path required');
      process.exit(1);
    }
    const document = loadDocument(inputPath);
    const { code, warnings } = generateTsx({ document, imports: {} });
    writeFileSync(outputPath, code);
    console.log(`Wrote ${outputPath}`);
    for (const w of warnings) console.warn(`Warning: ${w}`);
    break;
  }
  case 'validate': {
    const inputPath = args[0];
    if (!inputPath) {
      console.error('Error: input JSON path required');
      process.exit(1);
    }
    const document = loadDocument(inputPath);
    if (document.version !== '0.1' || !document.root) {
      console.error('Invalid ViewFoundry document');
      process.exit(1);
    }
    console.log('Valid ViewFoundry document');
    break;
  }
  case 'init':
    console.log('viewfoundry init is not yet implemented. Use examples/basic-react as a starting point.');
    break;
  case '--help':
  case '-h':
  case undefined:
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
