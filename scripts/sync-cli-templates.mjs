#!/usr/bin/env node
/**
 * Sync example apps into packages/cli/templates for viewfoundry init.
 * Run after changing examples: node scripts/sync-cli-templates.mjs
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const TEMPLATES_DIR = join(ROOT, 'packages/cli/templates');

const TEMPLATE_SOURCES = [
  { id: 'default', source: 'examples/basic-react' },
  { id: 'landing-page', source: 'examples/landing-page' },
  { id: 'dashboard-builder', source: 'examples/dashboard-builder' },
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const SKIP_FILES = new Set(['GeneratedView.tsx', 'tsconfig.tsbuildinfo', 'pnpm-lock.yaml']);

function transformPackageJson(raw) {
  const pkg = JSON.parse(raw);
  pkg.name = '{{PROJECT_NAME}}';
  pkg.version = '0.0.0';
  pkg.private = true;

  for (const section of ['dependencies', 'devDependencies']) {
    if (!pkg[section]) continue;
    for (const [name, version] of Object.entries(pkg[section])) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        if (name.startsWith('@viewfoundry/')) {
          pkg[section][name] = '^{{VERSION}}';
        }
      }
    }
  }

  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function transformReadme(content) {
  return content.replace(
    /## Run locally\n\nFrom the monorepo root:\n\n```bash\npnpm install\npnpm build\npnpm dev\n```\n\nOr from this directory:\n\n```bash\npnpm install\npnpm dev\n```/,
    '## Run locally\n\n```bash\nnpm install\nnpm run dev\n```',
  );
}

function transformText(content) {
  return content
    .replace(/ViewFoundry \d+\.\d+\.\d+/g, 'ViewFoundry {{ VERSION }}')
    .replaceAll('ViewFoundry {{VERSION}}', 'ViewFoundry {{ VERSION }}');
}

function copyTemplate(id, sourceRel) {
  const source = join(ROOT, sourceRel);
  const target = join(TEMPLATES_DIR, id);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });

  cpSync(source, target, {
    recursive: true,
    filter(src) {
      const parts = src.split('/');
      if (parts.some((p) => SKIP_DIRS.has(p))) return false;
      const base = parts[parts.length - 1];
      if (SKIP_FILES.has(base)) return false;
      return true;
    },
  });

  const pkgPath = join(target, 'package.json');
  writeFileSync(pkgPath, transformPackageJson(readFileSync(pkgPath, 'utf-8')));

  const textFiles = ['README.md', 'src/App.tsx', 'vite.config.ts'];
  for (const rel of textFiles) {
    const path = join(target, rel);
    try {
      const raw = readFileSync(path, 'utf-8');
      const transformed =
        rel === 'README.md' ? transformReadme(transformText(raw)) : transformText(raw);
      writeFileSync(path, transformed);
    } catch {
      // optional file
    }
  }

  console.log(`Synced ${sourceRel} -> packages/cli/templates/${id}`);
}

rmSync(TEMPLATES_DIR, { recursive: true, force: true });
mkdirSync(TEMPLATES_DIR, { recursive: true });

for (const { id, source } of TEMPLATE_SOURCES) {
  copyTemplate(id, source);
}

console.log('CLI templates synced.');
