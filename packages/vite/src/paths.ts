import { isAbsolute, relative, resolve, sep } from 'node:path';

/** Resolve a path relative to root and reject escapes outside the project root. */
export function resolvePathWithinRoot(root: string, relativePath: string): string | null {
  const resolved = resolve(root, relativePath);
  const rel = relative(root, resolved);
  if (isAbsolute(rel)) {
    return null;
  }
  if (rel.startsWith('..') || rel.split(sep).includes('..')) {
    return null;
  }
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;
  if (!resolved.startsWith(rootWithSep) && resolved !== root) {
    return null;
  }
  return resolved;
}

export function pathsEqual(a: string, b: string): boolean {
  return resolve(a) === resolve(b);
}
