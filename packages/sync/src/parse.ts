import ts from 'typescript';
import type { SourceElementId, SourceLocation } from '@viewfoundry/core';

export type ParsedJsxElement = {
  id: SourceElementId;
  tagName: string;
  location: SourceLocation;
  parentId: SourceElementId | null;
  childIds: SourceElementId[];
  isSelfClosing: boolean;
};

export type ParsedSourceFile = {
  file: string;
  content: string;
  elements: Map<SourceElementId, ParsedJsxElement>;
  rootIds: SourceElementId[];
};

function elementId(file: string, start: number): SourceElementId {
  return `${file}:${start}`;
}

function getLineColumn(sourceFile: ts.SourceFile, pos: number): { line: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, column: character + 1 };
}

function getJsxTagName(name: ts.JsxTagNameExpression): string {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isPropertyAccessExpression(name)) return name.name.text;
  return 'Unknown';
}

export function parseSourceFile(file: string, content: string): ParsedSourceFile {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = new Map<SourceElementId, ParsedJsxElement>();
  const rootIds: SourceElementId[] = [];

  function visit(node: ts.Node, parentId: SourceElementId | null) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      const id = elementId(file, start);
      const tagName = ts.isJsxElement(node)
        ? getJsxTagName(node.openingElement.tagName)
        : getJsxTagName(node.tagName);
      const isSelfClosing = ts.isJsxSelfClosingElement(node);
      const { line, column } = getLineColumn(sourceFile, start);

      const parsed: ParsedJsxElement = {
        id,
        tagName,
        location: { file, start, end, line, column },
        parentId,
        childIds: [],
        isSelfClosing,
      };
      elements.set(id, parsed);
      if (parentId === null) {
        rootIds.push(id);
      } else {
        elements.get(parentId)?.childIds.push(id);
      }

      if (ts.isJsxElement(node)) {
        for (const child of node.children) {
          if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
            visit(child, id);
          }
        }
      }
      return;
    }
    ts.forEachChild(node, (child) => visit(child, parentId));
  }

  visit(sourceFile, null);
  return { file, content, elements, rootIds };
}

export function findJsxElementAt(
  parsed: ParsedSourceFile,
  offset: number,
): ParsedJsxElement | undefined {
  let best: ParsedJsxElement | undefined;
  for (const el of parsed.elements.values()) {
    if (offset >= el.location.start && offset <= el.location.end) {
      if (!best || el.location.end - el.location.start < best.location.end - best.location.start) {
        best = el;
      }
    }
  }
  return best;
}

export function buildSourceMap(parsed: ParsedSourceFile): Map<SourceElementId, SourceLocation> {
  const map = new Map<SourceElementId, SourceLocation>();
  for (const [id, el] of parsed.elements) {
    map.set(id, el.location);
  }
  return map;
}

export function validateSourceContent(file: string, content: string): { valid: true } | { valid: false; error: string } {
  try {
    ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid TSX' };
  }
}

function parseJsxPropValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner.startsWith('"') || inner.startsWith("'")) {
      try {
        return JSON.parse(inner.replace(/^'|'$/g, '"'));
      } catch {
        return inner.slice(1, -1);
      }
    }
    if (inner === 'true') return true;
    if (inner === 'false') return false;
    if (inner === 'undefined') return undefined;
    const num = Number(inner);
    if (!Number.isNaN(num)) return num;
    return inner;
  }
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function extractJsxProps(content: string, element: ParsedJsxElement): Record<string, unknown> {
  const slice = content.slice(element.location.start, element.location.end);
  const openEnd = slice.indexOf('>');
  const openTag = openEnd >= 0 ? slice.slice(0, openEnd + 1) : slice;
  const props: Record<string, unknown> = {};
  const attrRegex = /([\w.-]+)\s*=\s*(\{[^}]*\}|"[^"]*"|'[^']*')/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(openTag)) !== null) {
    const name = match[1];
    if (name.startsWith('data-vf-')) continue;
    props[name] = parseJsxPropValue(match[2]);
  }
  return props;
}
