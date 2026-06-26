import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { chdir, cwd } from 'node:process';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';
import { runCli } from '../packages/cli/src/cli.js';

const tempDirs: string[] = [];

test.afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

function withTempCwd(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'vf-cli-e2e-'));
  tempDirs.push(dir);
  const previousCwd = cwd();
  try {
    chdir(dir);
    run(dir);
  } finally {
    chdir(previousCwd);
  }
}

test.describe('CLI', () => {
  test('export with --imports produces import statements', () => {
    withTempCwd((dir) => {
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
      writeFileSync(join(dir, 'doc.json'), JSON.stringify(doc));
      writeFileSync(
        join(dir, 'imports.json'),
        JSON.stringify({
          Button: { importPath: './Button', exportName: 'Button' },
        }),
      );

      const result = runCli([
        'export',
        'doc.json',
        'E2eGeneratedView.tsx',
        '--imports',
        'imports.json',
      ]);
      expect(result.exitCode).toBe(0);
      const code = readFileSync(join(dir, 'E2eGeneratedView.tsx'), 'utf-8');
      expect(code).toContain("import { Button } from './Button'");
    });
  });

  test('init scaffolds default template with version in App header', () => {
    withTempCwd((dir) => {
      const result = runCli(['init', 'my-app', '--template', 'default']);
      expect(result.exitCode).toBe(0);
      const app = readFileSync(join(dir, 'my-app/src/App.tsx'), 'utf-8');
      expect(app).toMatch(/ViewFoundry 0\.5\.0/);
      expect(app).not.toContain('{{');
    });
  });
});
