import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateDocument, type ViewDocument } from '@viewfoundry/core';

export const VIRTUAL_DOCUMENT_ID = 'virtual:viewfoundry/document';
export const RESOLVED_DOCUMENT_ID = '\0viewfoundry:document';

export type LoadDocumentResult =
  | { ok: true; document: ViewDocument }
  | { ok: false; message: string };

export function loadDocumentFromFile(root: string, documentPath: string): LoadDocumentResult {
  const absolutePath = resolve(root, documentPath);
  let raw: string;
  try {
    raw = readFileSync(absolutePath, 'utf-8');
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Failed to read file';
    return {
      ok: false,
      message: `ViewFoundry document not found at ${documentPath}\n${detail}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Invalid JSON';
    return {
      ok: false,
      message: `Invalid JSON in ${documentPath}\n${detail}`,
    };
  }

  const validation = validateDocument(parsed as ViewDocument, undefined, {
    allowMissingComponents: true,
  });
  if (!validation.valid) {
    const issues = validation.issues
      .slice(0, 8)
      .map((issue) => `  ${issue.path}: ${issue.message}`)
      .join('\n');
    const suffix =
      validation.issues.length > 8 ? `\n  … and ${validation.issues.length - 8} more issue(s)` : '';
    return {
      ok: false,
      message: `Invalid ViewFoundry document in ${documentPath}\n${issues}${suffix}`,
    };
  }

  return { ok: true, document: parsed as ViewDocument };
}

export function documentModuleSource(document: ViewDocument): string {
  return `export default ${JSON.stringify(document)};\n`;
}
