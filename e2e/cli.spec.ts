import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { runCli } from '../packages/cli/src/cli.js';

test.describe('CLI', () => {
  test('export with --imports produces import statements', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vf-cli-e2e-'));
    const doc = {
      version: '0.1',
      root: {
        id: 'root',
        type: 'Root',
        children: [
          {
            id: 'b1',
            type: 'Button',
            props: { children: 'Hi' },
          },
        ],
      },
    };
    const inputPath = join(dir, 'doc.json');
    const outputPath = join(process.cwd(), 'E2eGeneratedView.tsx');
    const importsPath = join(dir, 'imports.json');
    writeFileSync(inputPath, JSON.stringify(doc));
    writeFileSync(
      importsPath,
      JSON.stringify({
        Button: { importPath: './Button', exportName: 'Button' },
      }),
    );

    const result = runCli(['export', inputPath, outputPath, '--imports', importsPath]);
    expect(result.exitCode).toBe(0);
    const code = readFileSync(outputPath, 'utf-8');
    expect(code).toContain("import { Button } from './Button'");

    unlinkSync(inputPath);
    unlinkSync(outputPath);
    unlinkSync(importsPath);
  });
});
