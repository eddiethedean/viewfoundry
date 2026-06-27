import ts from 'typescript';
import type { SourceElementId, SourceLocation } from '@viewfoundry/core';
import {
  createTsSourceFile,
  elementIdFromStart,
  extractPropsFromJsxNode,
  findJsxNodeAtStart,
  getJsxTagNameText,
  validateSourceContent as validateSourceContentAst,
} from './ast-utils.js';

export type ParsedJsxElement = {
  id: SourceElementId;
  tagName: string;
  location: SourceLocation;
  parentId: SourceElementId | null;
  childIds: SourceElementId[];
  isSelfClosing: boolean;
  openingTagEnd: number;
};

export type ParsedSourceFile = {
  file: string;
  content: string;
  elements: Map<SourceElementId, ParsedJsxElement>;
  rootIds: SourceElementId[];
  sourceFile: ts.SourceFile;
};

function getLineColumn(sourceFile: ts.SourceFile, pos: number): { line: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, column: character + 1 };
}

function registerElement(
  elements: Map<SourceElementId, ParsedJsxElement>,
  rootIds: SourceElementId[],
  parsed: ParsedJsxElement,
  parentId: SourceElementId | null,
): SourceElementId {
  elements.set(parsed.id, parsed);
  if (parentId === null) {
    rootIds.push(parsed.id);
  } else {
    elements.get(parentId)?.childIds.push(parsed.id);
  }
  return parsed.id;
}

function parseJsxElementNode(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  sourceFile: ts.SourceFile,
  file: string,
  parentId: SourceElementId | null,
  elements: Map<SourceElementId, ParsedJsxElement>,
  rootIds: SourceElementId[],
): SourceElementId {
  const start = node.getStart(sourceFile);
  const end = node.getEnd();
  const id = elementIdFromStart(file, start);
  const tagName = ts.isJsxElement(node)
    ? getJsxTagNameText(sourceFile, node.openingElement.tagName)
    : getJsxTagNameText(sourceFile, node.tagName);
  const isSelfClosing = ts.isJsxSelfClosingElement(node);
  const openingTagEnd = ts.isJsxElement(node) ? node.openingElement.getEnd() : node.getEnd();
  const { line, column } = getLineColumn(sourceFile, start);

  const parsed: ParsedJsxElement = {
    id,
    tagName,
    location: { file, start, end, line, column },
    parentId,
    childIds: [],
    isSelfClosing,
    openingTagEnd,
  };
  registerElement(elements, rootIds, parsed, parentId);

  if (ts.isJsxElement(node)) {
    for (const child of node.children) {
      visitJsxChild(child, sourceFile, file, id, elements, rootIds);
    }
  }

  return id;
}

function parseFragmentNode(
  node: ts.JsxFragment,
  sourceFile: ts.SourceFile,
  file: string,
  parentId: SourceElementId | null,
  elements: Map<SourceElementId, ParsedJsxElement>,
  rootIds: SourceElementId[],
): SourceElementId {
  const start = node.getStart(sourceFile);
  const end = node.getEnd();
  const id = elementIdFromStart(file, start);
  const { line, column } = getLineColumn(sourceFile, start);

  const parsed: ParsedJsxElement = {
    id,
    tagName: 'Fragment',
    location: { file, start, end, line, column },
    parentId,
    childIds: [],
    isSelfClosing: false,
    openingTagEnd: node.openingFragment.getEnd(),
  };
  registerElement(elements, rootIds, parsed, parentId);

  for (const child of node.children) {
    visitJsxChild(child, sourceFile, file, id, elements, rootIds);
  }

  return id;
}

function visitJsxChild(
  child: ts.JsxChild,
  sourceFile: ts.SourceFile,
  file: string,
  parentId: SourceElementId,
  elements: Map<SourceElementId, ParsedJsxElement>,
  rootIds: SourceElementId[],
): void {
  if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
    parseJsxElementNode(child, sourceFile, file, parentId, elements, rootIds);
  } else if (ts.isJsxFragment(child)) {
    parseFragmentNode(child, sourceFile, file, parentId, elements, rootIds);
  } else if (ts.isJsxExpression(child) && child.expression) {
    visitExpressionForJsx(child.expression, sourceFile, file, parentId, elements, rootIds);
  }
}

function visitExpressionForJsx(
  expr: ts.Expression,
  sourceFile: ts.SourceFile,
  file: string,
  parentId: SourceElementId,
  elements: Map<SourceElementId, ParsedJsxElement>,
  rootIds: SourceElementId[],
): void {
  if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) {
    parseJsxElementNode(expr, sourceFile, file, parentId, elements, rootIds);
    return;
  }
  if (ts.isJsxFragment(expr)) {
    parseFragmentNode(expr, sourceFile, file, parentId, elements, rootIds);
    return;
  }
  if (ts.isParenthesizedExpression(expr)) {
    visitExpressionForJsx(expr.expression, sourceFile, file, parentId, elements, rootIds);
    return;
  }
  if (ts.isBinaryExpression(expr)) {
    visitExpressionForJsx(expr.left, sourceFile, file, parentId, elements, rootIds);
    visitExpressionForJsx(expr.right, sourceFile, file, parentId, elements, rootIds);
    return;
  }
  if (ts.isConditionalExpression(expr)) {
    visitExpressionForJsx(expr.whenTrue, sourceFile, file, parentId, elements, rootIds);
    visitExpressionForJsx(expr.whenFalse, sourceFile, file, parentId, elements, rootIds);
    return;
  }
  if (ts.isCallExpression(expr)) {
    for (const arg of expr.arguments) {
      visitExpressionForJsx(arg, sourceFile, file, parentId, elements, rootIds);
    }
  }
}

export function parseSourceFile(file: string, content: string): ParsedSourceFile {
  const sourceFile = createTsSourceFile(file, content);
  const elements = new Map<SourceElementId, ParsedJsxElement>();
  const rootIds: SourceElementId[] = [];

  function visitTop(node: ts.Node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      parseJsxElementNode(node, sourceFile, file, null, elements, rootIds);
      return;
    }
    if (ts.isJsxFragment(node)) {
      parseFragmentNode(node, sourceFile, file, null, elements, rootIds);
      return;
    }
    ts.forEachChild(node, visitTop);
  }

  visitTop(sourceFile);
  return { file, content, elements, rootIds, sourceFile };
}

export function findJsxElementAt(
  parsed: ParsedSourceFile,
  offset: number,
): ParsedJsxElement | undefined {
  let best: ParsedJsxElement | undefined;
  for (const el of parsed.elements.values()) {
    if (offset >= el.location.start && offset < el.location.end) {
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

export function validateSourceContent(
  file: string,
  content: string,
): { valid: true } | { valid: false; error: string } {
  return validateSourceContentAst(file, content);
}

export function extractJsxProps(
  content: string,
  element: ParsedJsxElement,
): Record<string, unknown> {
  const sourceFile = createTsSourceFile(element.location.file, content);
  const node = findJsxNodeAtStart(sourceFile, element.location.start);
  if (!node) return {};
  return extractPropsFromJsxNode(node, sourceFile);
}

export type ElementIdentity = {
  tagName: string;
  parentId: SourceElementId | null;
  siblingIndex: number;
};

export function getElementIdentity(
  parsed: ParsedSourceFile,
  elementId: SourceElementId,
): ElementIdentity | null {
  const el = parsed.elements.get(elementId);
  if (!el) return null;
  const parent = el.parentId ? parsed.elements.get(el.parentId) : null;
  const siblingIndex = parent
    ? parent.childIds.indexOf(elementId)
    : parsed.rootIds.indexOf(elementId);
  return { tagName: el.tagName, parentId: el.parentId, siblingIndex };
}

export function reconcileElementId(
  parsed: ParsedSourceFile,
  priorId: SourceElementId,
  priorIdentity: ElementIdentity | null,
): SourceElementId | null {
  if (parsed.elements.has(priorId)) return priorId;
  if (!priorIdentity) return null;
  return findElementByIdentity(parsed, priorIdentity);
}

export function findElementByIdentity(
  parsed: ParsedSourceFile,
  identity: ElementIdentity,
): SourceElementId | null {
  if (identity.parentId && parsed.elements.has(identity.parentId)) {
    const parent = parsed.elements.get(identity.parentId)!;
    if (identity.siblingIndex >= 0 && identity.siblingIndex < parent.childIds.length) {
      const childId = parent.childIds[identity.siblingIndex];
      const child = parsed.elements.get(childId);
      if (child?.tagName === identity.tagName) return childId;
    }
  }

  const candidates = [...parsed.elements.values()].filter(
    (e) => e.tagName === identity.tagName && e.parentId === identity.parentId,
  );
  candidates.sort((a, b) => a.location.start - b.location.start);
  if (identity.siblingIndex >= 0 && identity.siblingIndex < candidates.length) {
    return candidates[identity.siblingIndex]?.id ?? null;
  }
  return candidates[0]?.id ?? null;
}
