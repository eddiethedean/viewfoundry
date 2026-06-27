import ts from 'typescript';
import type { SourceElementId } from '@viewfoundry/core';

export function createTsSourceFile(file: string, content: string): ts.SourceFile {
  return ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

type SourceFileWithDiagnostics = ts.SourceFile & {
  parseDiagnostics?: readonly ts.Diagnostic[];
};

function getParseDiagnostics(sourceFile: ts.SourceFile): readonly ts.Diagnostic[] {
  return (sourceFile as SourceFileWithDiagnostics).parseDiagnostics ?? [];
}

export function validateSourceContent(
  file: string,
  content: string,
): { valid: true } | { valid: false; error: string } {
  const sourceFile = createTsSourceFile(file, content);
  const diagnostics = getParseDiagnostics(sourceFile);
  if (diagnostics.length > 0) {
    const first = diagnostics[0];
    const message = ts.flattenDiagnosticMessageText(first.messageText, '\n');
    return { valid: false, error: message };
  }
  return { valid: true };
}

export function getJsxTagNameText(
  sourceFile: ts.SourceFile,
  name: ts.JsxTagNameExpression,
): string {
  return name.getText(sourceFile);
}

export function findJsxNodeAtStart(
  sourceFile: ts.SourceFile,
  start: number,
): ts.JsxElement | ts.JsxSelfClosingElement | null {
  let found: ts.JsxElement | ts.JsxSelfClosingElement | null = null;

  function visit(node: ts.Node) {
    if (found) return;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (node.getStart(sourceFile) === start) {
        found = node;
        return;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

export function getOpeningTagEnd(node: ts.JsxElement | ts.JsxSelfClosingElement): number {
  if (ts.isJsxSelfClosingElement(node)) {
    return node.getEnd();
  }
  return node.openingElement.getEnd();
}

export function formatPropValueForJsx(value: unknown): string {
  if (typeof value === 'string') return `{${JSON.stringify(value)}}`;
  if (typeof value === 'number' || typeof value === 'boolean') return `{${String(value)}}`;
  if (value === null || value === undefined) return '{undefined}';
  return `{${JSON.stringify(value)}}`;
}

function expressionToValue(node: ts.Expression): unknown {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return undefined;
  if (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node)) {
    return node.getText();
  }
  return node.getText();
}

export function extractPropsFromJsxNode(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  sourceFile: ts.SourceFile,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const attrs = ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;

  for (const prop of attrs.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    const name = prop.name.getText(sourceFile);
    if (name.startsWith('data-vf-')) continue;

    if (!prop.initializer) {
      props[name] = true;
      continue;
    }

    if (ts.isStringLiteral(prop.initializer)) {
      props[name] = prop.initializer.text;
    } else if (prop.initializer.kind === ts.SyntaxKind.JsxExpression) {
      const expr = prop.initializer.expression;
      if (expr) {
        props[name] = expressionToValue(expr);
      }
    }
  }

  return props;
}

export function findAttributeSpan(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  sourceFile: ts.SourceFile,
  propName: string,
): { start: number; end: number; isShorthand: boolean } | null {
  const attrs = ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;

  for (const prop of attrs.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    if (prop.name.getText(sourceFile) !== propName) continue;
    if (!prop.initializer) {
      return { start: prop.getStart(sourceFile), end: prop.getEnd(), isShorthand: true };
    }
    return { start: prop.getStart(sourceFile), end: prop.getEnd(), isShorthand: false };
  }
  return null;
}

export function elementIdFromStart(file: string, start: number): SourceElementId {
  return `${file}:${start}`;
}
