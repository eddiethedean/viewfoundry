// @vitest-environment node
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { runInit, parseInitArgs, TEMPLATE_IDS, getCliVersion } from './init.js';

describe('parseInitArgs', () => {
  it('defaults to viewfoundry-app and default template', () => {
    const parsed = parseInitArgs([]);
    expect(parsed.targetDir).toBe('viewfoundry-app');
    expect(parsed.template).toBe('default');
    expect(parsed.force).toBe(false);
  });

  it('parses template and target dir', () => {
    const parsed = parseInitArgs(['my-app', '--template', 'landing-page', '--force']);
    expect(parsed.targetDir).toBe('my-app');
    expect(parsed.template).toBe('landing-page');
    expect(parsed.force).toBe(true);
  });

  it('rejects unknown template', () => {
    expect(() => parseInitArgs(['--template', 'nope'])).toThrow(/Unknown template/);
  });

  it('rejects unknown flags', () => {
    expect(() => parseInitArgs(['--nope'])).toThrow(/Unknown option/);
  });
});

describe('runInit', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  for (const template of TEMPLATE_IDS) {
    it(`scaffolds ${template} template`, () => {
      const cwd = mkdtempSync(join(tmpdir(), 'vf-init-cwd-'));
      dirs.push(cwd);
      const targetDir = join(cwd, 'app');
      const result = runInit({
        targetDir: 'app',
        template,
        projectName: 'app',
        force: false,
        cwd,
      });
      expect(result.ok).toBe(true);
      expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
      expect(existsSync(join(targetDir, 'viewfoundry/document.json'))).toBe(true);
      expect(existsSync(join(targetDir, 'vite.config.ts'))).toBe(true);
      const pkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf-8')) as {
        name: string;
        dependencies: Record<string, string>;
      };
      expect(pkg.name).toBe('app');
      expect(pkg.dependencies['@viewfoundry/core']).toMatch(/^\^/);
      const appSource = readFileSync(join(targetDir, 'src/App.tsx'), 'utf-8');
      expect(appSource).toMatch(new RegExp(`ViewFoundry ${getCliVersion().replace(/\./g, '\\.')}`));
      expect(appSource).not.toContain('{{');
    });
  }

  it('refuses non-empty directory without force', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'vf-init-cwd-'));
    dirs.push(cwd);
    mkdirSync(join(cwd, 'app'));
    writeFileSync(join(cwd, 'app', 'existing.txt'), 'x');
    const result = runInit({
      targetDir: 'app',
      template: 'default',
      projectName: 'app',
      force: false,
      cwd,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('not empty');
    }
  });
});
