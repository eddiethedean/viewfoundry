const IDENTIFIER_PATTERN = /^[A-Za-z_$][\w$]*$/;
const IMPORT_PATH_PATTERN = /^[@a-zA-Z0-9._\-/]+$/;

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_PATTERN.test(value);
}

export function isValidImportPath(value: string): boolean {
  return IMPORT_PATH_PATTERN.test(value) && !value.includes('..');
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
