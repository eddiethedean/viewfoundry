const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;
const IMPORT_PATH_PATTERN = /^[@a-zA-Z0-9._\-/]+$/;

const RESERVED_IDENTIFIERS = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'let',
  'static',
  'enum',
  'implements',
  'interface',
  'package',
  'private',
  'protected',
  'public',
  'await',
]);

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_PATTERN.test(value) && !RESERVED_IDENTIFIERS.has(value);
}

export function isValidImportPath(value: string): boolean {
  if (!IMPORT_PATH_PATTERN.test(value) || value.includes('..')) {
    return false;
  }
  if (value.startsWith('/')) {
    return false;
  }
  return value.startsWith('./') || value.startsWith('../') || value.startsWith('@');
}

export function sanitizeCommentText(value: string): string {
  return value.replace(/-->/g, '--&gt;').replace(/<!--/g, '');
}

export function resolveComponentName(name: string | undefined, warnings: string[]): string {
  const candidate = name ?? 'GeneratedView';
  if (!isValidIdentifier(candidate)) {
    warnings.push(`Invalid component name "${candidate}" — using GeneratedView`);
    return 'GeneratedView';
  }
  return candidate;
}
