import MagicString from 'magic-string';
import type {
  DeleteJsxElementPayload,
  FileCommandResult,
  FilePatch,
  InsertJsxElementPayload,
  MoveJsxElementPayload,
  SourceElementId,
  UpdateJsxPropPayload,
} from '@viewfoundry/core';
import { parseSourceFile, type ParsedSourceFile } from './parse.js';

function patchResult(file: string, content: string): FileCommandResult {
  return { ok: true, patches: [{ file, content }] };
}

function fail(error: string): FileCommandResult {
  return { ok: false, error };
}

function getElement(parsed: ParsedSourceFile, id: SourceElementId) {
  const el = parsed.elements.get(id);
  if (!el) return undefined;
  return el;
}

export function patchDeleteElement(
  content: string,
  payload: DeleteJsxElementPayload,
): FileCommandResult {
  const parsed = parseSourceFile(payload.file, content);
  const el = getElement(parsed, payload.elementId);
  if (!el) return fail('Element not found');

  const s = new MagicString(content);
  s.remove(el.location.start, el.location.end);
  return patchResult(payload.file, s.toString());
}

export function patchInsertElement(
  content: string,
  payload: InsertJsxElementPayload,
): FileCommandResult {
  const parsed = parseSourceFile(payload.file, content);
  const parent = getElement(parsed, payload.parentElementId);
  if (!parent) return fail('Parent element not found');
  if (parent.isSelfClosing) return fail('Cannot insert into a self-closing element');

  const parsedFull = parseSourceFile(payload.file, content);
  const parentNode = getElement(parsedFull, payload.parentElementId)!;
  const insertIndex = payload.index ?? parentNode.childIds.length;

  let insertPos: number;
  if (parentNode.childIds.length === 0) {
    const openEnd = findOpeningTagEnd(content, parent.location.start);
    insertPos = openEnd;
  } else if (insertIndex >= parentNode.childIds.length) {
    const lastChild = parsedFull.elements.get(parentNode.childIds[parentNode.childIds.length - 1])!;
    insertPos = lastChild.location.end;
  } else {
    const sibling = parsedFull.elements.get(parentNode.childIds[insertIndex])!;
    insertPos = sibling.location.start;
  }

  const jsx = payload.jsx.trim();
  const s = new MagicString(content);
  s.appendLeft(insertPos, `\n${jsx}`);
  return patchResult(payload.file, s.toString());
}

export function patchSetProp(
  content: string,
  payload: UpdateJsxPropPayload,
): FileCommandResult {
  const parsed = parseSourceFile(payload.file, content);
  const el = getElement(parsed, payload.elementId);
  if (!el) return fail('Element not found');

  const sourceFile = parsed.content;
  const tagSlice = sourceFile.slice(el.location.start, el.location.end);
  const propName = payload.propName;
  const valueStr = formatPropValue(payload.value);

  const attrRegex = new RegExp(`\\b${escapeRegExp(propName)}\\s*=\\s*(\\{[^}]*\\}|"[^"]*"|'[^']*')`);
  const s = new MagicString(sourceFile);

  if (attrRegex.test(tagSlice)) {
    const match = tagSlice.match(attrRegex);
    if (!match || match.index === undefined) return fail('Could not update prop');
    const absStart = el.location.start + match.index;
    const absEnd = absStart + match[0].length;
    s.overwrite(absStart, absEnd, `${propName}=${valueStr}`);
  } else {
    const insertAt = findPropInsertPoint(sourceFile, el.location.start, el.location.end);
    s.appendLeft(insertAt, ` ${propName}=${valueStr}`);
  }

  return patchResult(payload.file, s.toString());
}

export function patchMoveElement(
  content: string,
  payload: MoveJsxElementPayload,
): FileCommandResult {
  const parsed = parseSourceFile(payload.file, content);
  const el = getElement(parsed, payload.elementId);
  const parent = getElement(parsed, payload.parentElementId);
  if (!el) return fail('Element not found');
  if (!parent) return fail('Target parent not found');
  if (parent.isSelfClosing) return fail('Cannot move into a self-closing element');
  if (el.id === parent.id) return fail('Cannot move an element into itself');

  const jsxSnippet = content.slice(el.location.start, el.location.end);
  const deleteResult = patchDeleteElement(content, {
    file: payload.file,
    elementId: payload.elementId,
  });
  if (!deleteResult.ok) return deleteResult;

  const reparsed = parseSourceFile(payload.file, deleteResult.patches[0].content);
  const newParent = getElement(reparsed, payload.parentElementId);
  if (!newParent) return fail('Target parent not found after delete');

  return patchInsertElement(deleteResult.patches[0].content, {
    file: payload.file,
    parentElementId: payload.parentElementId,
    index: payload.index,
    jsx: jsxSnippet,
  });
}

export function applyPatchesToContent(
  files: Record<string, string>,
  patches: FilePatch[],
): Record<string, string> {
  const next = { ...files };
  for (const patch of patches) {
    next[patch.file] = patch.content;
  }
  return next;
}

function formatPropValue(value: unknown): string {
  if (typeof value === 'string') return `{${JSON.stringify(value)}}`;
  if (typeof value === 'number' || typeof value === 'boolean') return `{${String(value)}}`;
  if (value === null || value === undefined) return '{undefined}';
  return `{${JSON.stringify(value)}}`;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findOpeningTagEnd(content: string, start: number): number {
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    if (content[i] === '<') depth++;
    if (content[i] === '>' && content[i - 1] !== '-') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return start;
}

function findPropInsertPoint(content: string, start: number, end: number): number {
  const slice = content.slice(start, end);
  const selfClose = slice.indexOf('/>');
  if (selfClose >= 0) return start + selfClose;
  const close = slice.lastIndexOf('>');
  if (close >= 0) return start + close;
  return end;
}

export function validateAllowedChild(
  parentTag: string,
  childTag: string,
  allowedChildren: string[] | undefined,
  parentLabel?: string,
  childLabel?: string,
): FileCommandResult | null {
  if (!allowedChildren) return null;
  if (allowedChildren.includes(childTag)) return null;
  const parentName = parentLabel ?? parentTag;
  const childName = childLabel ?? childTag;
  return fail(`${childName} cannot go inside ${parentName}`);
}
