import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function packageDir(): string {
  const url = import.meta.url;
  if (url.startsWith('file:')) {
    return join(dirname(fileURLToPath(url)), '..');
  }
  return join(process.cwd(), 'packages/cli');
}

export function getCliVersion(): string {
  try {
    const pkgPath = join(packageDir(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return '0.5.0';
  }
}

export const TEMPLATE_IDS = ['default', 'landing-page', 'dashboard-builder'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type InitOptions = {
  targetDir: string;
  template: TemplateId;
  projectName: string;
  force: boolean;
  cwd: string;
};

export type InitResult = { ok: true } | { ok: false; message: string };

const TEXT_EXTENSIONS = new Set([
  '.json',
  '.md',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.jsx',
  '.js',
  '.mjs',
]);

function templatesRoot(): string {
  return join(packageDir(), 'templates');
}

function isDirectoryEmpty(dir: string): boolean {
  if (!existsSync(dir)) return true;
  return readdirSync(dir).length === 0;
}

function replaceTokens(content: string, projectName: string, version: string): string {
  return content
    .replaceAll('{{PROJECT_NAME}}', projectName)
    .replaceAll('{{VERSION}}', version)
    .replaceAll('{{ VERSION }}', version);
}

function copyTemplateTree(
  sourceDir: string,
  targetDir: string,
  projectName: string,
  version: string,
): void {
  mkdirSync(targetDir, { recursive: true });
  for (const entry of readdirSync(sourceDir)) {
    const srcPath = join(sourceDir, entry);
    const destPath = join(targetDir, entry);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyTemplateTree(srcPath, destPath, projectName, version);
      continue;
    }
    const ext = entry.includes('.') ? entry.slice(entry.lastIndexOf('.')) : '';
    if (TEXT_EXTENSIONS.has(ext)) {
      const raw = readFileSync(srcPath, 'utf-8');
      writeFileSync(destPath, replaceTokens(raw, projectName, version));
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

export function resolveInitTargetDir(targetArg: string | undefined, cwd: string): string {
  const dir = targetArg ?? 'viewfoundry-app';
  const resolved = resolve(cwd, dir);
  const rel = relative(cwd, resolved);
  if (rel.startsWith('..') || rel.split(sep).includes('..')) {
    throw new Error('Target directory must stay within the current working directory');
  }
  return resolved;
}

export function parseInitArgs(args: string[]): Omit<InitOptions, 'cwd'> {
  let targetDir = 'viewfoundry-app';
  let template: TemplateId = 'default';
  let force = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--force') {
      force = true;
      continue;
    }
    if (arg === '--template') {
      const value = args[++i];
      if (!value) throw new Error('--template requires a value');
      if (!TEMPLATE_IDS.includes(value as TemplateId)) {
        throw new Error(`Unknown template "${value}". Choose: ${TEMPLATE_IDS.join(', ')}`);
      }
      template = value as TemplateId;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    targetDir = arg;
  }

  const projectName = basename(resolve(targetDir));
  return { targetDir, template, projectName, force };
}

export function runInit(options: InitOptions): InitResult {
  const { targetDir, template, projectName, force, cwd } = options;
  let resolvedTarget: string;
  try {
    resolvedTarget = resolveInitTargetDir(targetDir, cwd);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Invalid target directory',
    };
  }

  if (existsSync(resolvedTarget) && !isDirectoryEmpty(resolvedTarget) && !force) {
    return {
      ok: false,
      message: `Directory "${relative(cwd, resolvedTarget) || '.'}" is not empty. Use --force to scaffold anyway.`,
    };
  }

  const templateDir = join(templatesRoot(), template);
  if (!existsSync(templateDir)) {
    return {
      ok: false,
      message: `Template "${template}" is not bundled with this CLI install.`,
    };
  }

  const version = getCliVersion();
  copyTemplateTree(templateDir, resolvedTarget, projectName, version);

  if (force && existsSync(resolvedTarget)) {
    console.warn(
      'Warning: --force overwrites existing files in the target directory when scaffolding.',
    );
  }

  return { ok: true };
}

export function printInitNextSteps(targetDir: string, template: TemplateId, cwd: string): void {
  const rel = relative(cwd, resolve(cwd, targetDir)) || '.';
  const cdStep = rel === '.' ? undefined : `cd ${rel}`;
  console.log(`Created ViewFoundry project (${template} template) at ${rel}`);
  console.log('');
  console.log('Next steps:');
  if (cdStep) console.log(`  ${cdStep}`);
  console.log('  npm install');
  console.log('  npm run dev');
  console.log('');
  console.log('Edit viewfoundry/document.json while the dev server runs to hot-reload the canvas.');
}
