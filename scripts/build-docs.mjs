#!/usr/bin/env node
/**
 * Build ViewFoundry documentation for Read the Docs and local preview.
 *
 * 1. Build @viewfoundry/* packages
 * 2. Build docs-studio Vite bundle
 * 3. Copy studio assets into apps/docs/_static/studio
 * 4. Run sphinx-build
 */

import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'apps/docs');
const studioDist = join(root, 'apps/docs-studio/dist');
const staticStudio = join(docsDir, '_static/studio');
const outputDir =
  process.env.READTHEDOCS_OUTPUT || process.env.SPHINX_OUTPUT || join(docsDir, '_build/html');

function run(command) {
  execSync(command, { cwd: root, stdio: 'inherit' });
}

console.log('Building @viewfoundry packages…');
run('pnpm -r --filter "./packages/*" build');

console.log('Building docs studio embed…');
run('pnpm --filter docs-studio build');

console.log('Copying studio bundle to Sphinx static assets…');
rmSync(staticStudio, { recursive: true, force: true });
mkdirSync(join(docsDir, '_static'), { recursive: true });
cpSync(studioDist, staticStudio, { recursive: true });

console.log(`Running sphinx-build → ${outputDir}`);
mkdirSync(outputDir, { recursive: true });
run(`python3 -m sphinx -b html "${docsDir}" "${outputDir}"`);

console.log('Documentation build complete.');
