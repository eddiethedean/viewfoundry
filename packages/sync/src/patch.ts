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
import {
  findAttributeSpan,
  findJsxNodeAtStart,
  formatPropValueForJsx,
  getOpeningTagEnd,
  validateSourceContent,
} from './ast-utils.js';
import { parseSourceFile, type ParsedSourceFile } from './parse.js';

function patchResult(file: string, content: string): FileCommandResult {
  const validation = validateSourceContent(file, content);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }
  return { ok: true, patches: [{ file, content }] };
}

function fail(error: string): FileCommandResult {
  return { ok: false, error };
}

function getElement(parsed: ParsedSourceFile, id: SourceElementId) {
  return parsed.elements.get(id);
}

function ensureValidInput(
  file: string,
  content: string,
): { ok: true; parsed: ParsedSourceFile } | { ok: false; error: string } {
  const validation = validateSourceContent(file, content);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }
  return { ok: true, parsed: parseSourceFile(file, content) };
}

export function patchDeleteElement(
  content: string,
  payload: DeleteJsxElementPayload,
): FileCommandResult {
  const input = ensureValidInput(payload.file, content);
  if (!input.ok) return fail(input.error);
  const el = getElement(input.parsed, payload.elementId);
  if (!el) return fail('Element not found');

  const s = new MagicString(content);
  s.remove(el.location.start, el.location.end);
  return patchResult(payload.file, s.toString());
}

export function patchInsertElement(
  content: string,
  payload: InsertJsxElementPayload,
): FileCommandResult {
  const input = ensureValidInput(payload.file, content);
  if (!input.ok) return fail(input.error);
  const parent = getElement(input.parsed, payload.parentElementId);
  if (!parent) return fail('Parent element not found');
  if (parent.isSelfClosing) return fail('Cannot insert into a self-closing element');

  const insertIndex = payload.index ?? parent.childIds.length;
  if (insertIndex < 0 || insertIndex > parent.childIds.length) {
    return fail(`Invalid insert index: ${insertIndex}`);
  }

  let insertPos: number;
  if (parent.childIds.length === 0) {
    insertPos = parent.openingTagEnd;
  } else if (insertIndex >= parent.childIds.length) {
    const lastChild = input.parsed.elements.get(parent.childIds[parent.childIds.length - 1])!;
    insertPos = lastChild.location.end;
  } else {
    const sibling = input.parsed.elements.get(parent.childIds[insertIndex])!;
    insertPos = sibling.location.start;
  }

  const jsx = payload.jsx.trim();
  const s = new MagicString(content);
  s.appendLeft(insertPos, `\n${jsx}`);
  return patchResult(payload.file, s.toString());
}

export function patchSetProp(content: string, payload: UpdateJsxPropPayload): FileCommandResult {
  const input = ensureValidInput(payload.file, content);
  if (!input.ok) return fail(input.error);
  const el = getElement(input.parsed, payload.elementId);
  if (!el) return fail('Element not found');

  const node = findJsxNodeAtStart(input.parsed.sourceFile, el.location.start);
  if (!node) return fail('Could not resolve JSX node for element');

  const propName = payload.propName;
  const valueStr = formatPropValueForJsx(payload.value);
  const s = new MagicString(content);
  const attrSpan = findAttributeSpan(node, input.parsed.sourceFile, propName);

  if (attrSpan) {
    s.overwrite(attrSpan.start, attrSpan.end, `${propName}=${valueStr}`);
  } else {
    const insertAt = getOpeningTagEnd(node);
    s.appendLeft(insertAt, ` ${propName}=${valueStr}`);
  }

  return patchResult(payload.file, s.toString());
}

export function patchMoveElement(
  content: string,
  payload: MoveJsxElementPayload,
): FileCommandResult {
  const input = ensureValidInput(payload.file, content);
  if (!input.ok) return fail(input.error);
  const el = getElement(input.parsed, payload.elementId);
  const parent = getElement(input.parsed, payload.parentElementId);
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
  const byFile = new Map<string, FilePatch[]>();
  for (const patch of patches) {
    const list = byFile.get(patch.file) ?? [];
    list.push(patch);
    byFile.set(patch.file, list);
  }
  for (const [file, filePatches] of byFile) {
    let content = next[file] ?? '';
    for (const patch of filePatches) {
      content = patch.content;
    }
    next[file] = content;
  }
  return next;
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

export function isAncestor(
  parsed: ParsedSourceFile,
  ancestorId: SourceElementId,
  descendantId: SourceElementId,
): boolean {
  let current = parsed.elements.get(descendantId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = parsed.elements.get(current.parentId);
  }
  return false;
}
