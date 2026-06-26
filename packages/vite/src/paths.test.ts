// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, describe, expect, it } from 'vitest';
import { pathsEqual, resolvePathWithinRoot } from './paths.js';

describe('resolvePathWithinRoot', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    dirs.length = 0;
  });

  it('resolves valid relative paths', () => {
    const root = mkdtempSync(join(tmpdir(), 'vf-paths-'));
    dirs.push(root);
    const resolved = resolvePathWithinRoot(root, 'viewfoundry/document.json');
    expect(resolved).toBe(join(root, 'viewfoundry/document.json'));
  });

  it('rejects path traversal', () => {
    const root = mkdtempSync(join(tmpdir(), 'vf-paths-'));
    dirs.push(root);
    expect(resolvePathWithinRoot(root, '../../../etc/passwd')).toBeNull();
    expect(resolvePathWithinRoot(root, 'viewfoundry/../../outside.json')).toBeNull();
  });

  it('compares normalized paths', () => {
    expect(pathsEqual('/tmp/a/b', '/tmp/a/b')).toBe(true);
  });
});
