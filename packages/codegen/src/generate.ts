import type { ViewDocument, ViewNode } from '@viewfoundry/core';
import {
  isGridContainer,
  placementToCss,
  resolveStyleValue,
  sortChildrenByGridOrder,
} from '@viewfoundry/core';
import {
  isValidIdentifier,
  isValidImportPath,
  resolveComponentName,
  sanitizeCommentText,
} from './sanitize.js';

export type ComponentImportMap = Record<
  string,
  {
    importPath: string;
    exportName: string;
    defaultImport?: boolean;
  }
>;

export type CodegenInput = {
  document: ViewDocument;
  imports: ComponentImportMap;
  componentName?: string;
  styleTokens?: Record<string, string | number>;
};

export type CodegenOutput = {
  code: string;
  warnings: string[];
};

function escapeString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function isJsonSerializable(value: unknown): boolean {
  if (value === null) return true;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return true;
  if (Array.isArray(value)) return value.every(isJsonSerializable);
  if (t === 'object') {
    return Object.values(value as Record<string, unknown>).every(isJsonSerializable);
  }
  return false;
}

function formatPropValue(value: unknown, warnings: string[], path: string): string | null {
  if (value === undefined) return null;
  if (typeof value === 'function') {
    warnings.push(`Unsupported function value at ${path}`);
    return null;
  }
  if (!isJsonSerializable(value)) {
    warnings.push(`Unsupported value at ${path}`);
    return null;
  }
  if (typeof value === 'string') return `'${escapeString(value)}'`;
  if (typeof value === 'boolean') return `{${value}}`;
  if (typeof value === 'number') return `{${value}}`;
  if (value === null) return '{null}';
  return `{${JSON.stringify(value)}}`;
}

function renderGridStyleAttr(node: ViewNode, parent: ViewNode | null): string {
  if (!parent || !isGridContainer(parent.type) || !node.layout?.grid) return '';
  const css = placementToCss(node.layout.grid);
  const entries = Object.entries(css).map(([key, value]) => `${key}: '${value}'`);
  return ` style={{ ${entries.join(', ')} }}`;
}

function buildMergedStyleObject(
  node: ViewNode,
  warnings: string[],
  styleTokens?: Record<string, string | number>,
): Record<string, string | number> | null {
  const propsStyle =
    node.props?.style && typeof node.props.style === 'object' && !Array.isArray(node.props.style)
      ? (node.props.style as Record<string, string | number>)
      : {};
  const nodeStyleEntries = Object.entries(node.style ?? {}).map(([key, value]) => {
    if (typeof value === 'string' && value.includes('.') && styleTokens?.[value] === undefined) {
      warnings.push(`Unresolved style token at ${node.type}.style.${key}: ${value}`);
    }
    return [key, resolveStyleValue(value, styleTokens)];
  });
  const merged = { ...propsStyle, ...Object.fromEntries(nodeStyleEntries) };
  return Object.keys(merged).length > 0 ? merged : null;
}

function renderStyleProp(
  node: ViewNode,
  warnings: string[],
  parent: ViewNode | null,
  styleTokens?: Record<string, string | number>,
): string | null {
  const merged = buildMergedStyleObject(node, warnings, styleTokens);
  if (!merged) return null;
  if (parent && isGridContainer(parent.type) && node.layout?.grid) {
    for (const key of Object.keys(placementToCss(node.layout.grid))) {
      delete merged[key as keyof typeof merged];
    }
    if (Object.keys(merged).length === 0) return null;
  }
  const formatted = formatPropValue(merged, warnings, `${node.type}.style`);
  if (formatted === null) return null;
  return `style=${formatted}`;
}

function renderProps(
  node: ViewNode,
  warnings: string[],
  hasChildNodes: boolean,
  _parent: ViewNode | null,
  styleTokens?: Record<string, string | number>,
): string {
  const props = { ...(node.props ?? {}) };
  if (typeof props.children === 'string' && !hasChildNodes) {
    delete props.children;
  }
  delete props.style;

  const parts: string[] = [];
  const styleProp = renderStyleProp(node, warnings, _parent, styleTokens);
  if (styleProp) parts.push(styleProp);

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue;
    if (!isValidIdentifier(key)) {
      warnings.push(`Skipping invalid prop key at ${node.type}.${key}`);
      continue;
    }
    const formatted = formatPropValue(value, warnings, `${node.type}.${key}`);
    if (formatted === null) continue;
    if (typeof value === 'boolean') {
      if (value) parts.push(key);
    } else {
      parts.push(`${key}=${formatted}`);
    }
  }
  const base = parts.length > 0 ? ' ' + parts.join(' ') : '';
  return base;
}

function renderNode(
  node: ViewNode,
  imports: ComponentImportMap,
  warnings: string[],
  indent: number,
  parent: ViewNode | null = null,
  styleTokens?: Record<string, string | number>,
): string {
  const pad = '  '.repeat(indent);
  const hasChildNodes = Boolean(node.children && node.children.length > 0);
  const stringChild =
    typeof node.props?.children === 'string' && !hasChildNodes ? node.props.children : null;

  if (node.type === 'Root') {
    if (!node.children || node.children.length === 0) {
      return `${pad}<></>`;
    }
    if (node.children.length === 1) {
      return renderNode(node.children[0], imports, warnings, indent, node, styleTokens);
    }
    const children = node.children
      .map((child) => renderNode(child, imports, warnings, indent + 1, node, styleTokens))
      .join('\n');
    return `${pad}<>\n${children}\n${pad}</>`;
  }

  const importInfo = imports[node.type];
  if (!importInfo) {
    warnings.push(`Missing import for component type: ${node.type}`);
    return `${pad}{/* Missing component: ${sanitizeCommentText(node.type)} */}`;
  }

  if (!isValidIdentifier(importInfo.exportName)) {
    warnings.push(`Invalid export name for ${node.type}: ${importInfo.exportName}`);
    return `${pad}{/* Missing component: ${sanitizeCommentText(node.type)} */}`;
  }

  const propsStr = renderProps(node, warnings, hasChildNodes, parent, styleTokens);
  const tag = importInfo.exportName;

  let rendered: string;

  if (hasChildNodes) {
    const childNodes = isGridContainer(node.type)
      ? sortChildrenByGridOrder(node.children!)
      : node.children!;
    const children = childNodes
      .map((child) => renderNode(child, imports, warnings, indent + 1, node, styleTokens))
      .join('\n');
    rendered = `${pad}<${tag}${propsStr}>\n${children}\n${pad}</${tag}>`;
  } else if (stringChild !== null) {
    rendered = `${pad}<${tag}${propsStr}>{${JSON.stringify(stringChild)}}</${tag}>`;
  } else if (propsStr) {
    rendered = `${pad}<${tag}${propsStr} />`;
  } else {
    rendered = `${pad}<${tag} />`;
  }

  const gridStyle = renderGridStyleAttr(node, parent);
  if (gridStyle) {
    const inner = rendered
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n');
    return `${pad}<div${gridStyle}>\n${inner}\n${pad}</div>`;
  }

  return rendered;
}

function buildImportStatements(
  imports: ComponentImportMap,
  usedTypes: Set<string>,
  warnings: string[],
): string {
  const lines: string[] = [];
  for (const type of usedTypes) {
    if (type === 'Root') continue;
    const info = imports[type];
    if (!info) continue;
    if (!isValidIdentifier(info.exportName)) {
      warnings.push(`Invalid export name for ${type}: ${info.exportName}`);
      continue;
    }
    if (!isValidImportPath(info.importPath)) {
      warnings.push(`Invalid import path for ${type}: ${info.importPath}`);
      continue;
    }
    if (info.defaultImport) {
      lines.push(`import ${info.exportName} from '${info.importPath}';`);
    } else {
      lines.push(`import { ${info.exportName} } from '${info.importPath}';`);
    }
  }
  return lines.sort().join('\n');
}

function collectTypes(node: ViewNode, types: Set<string>): void {
  if (node.type !== 'Root') types.add(node.type);
  if (node.children) {
    for (const child of node.children) collectTypes(child, types);
  }
}

export function generateTsx(input: CodegenInput): CodegenOutput {
  const warnings: string[] = [];
  const componentName = resolveComponentName(input.componentName, warnings);
  const usedTypes = new Set<string>();
  collectTypes(input.document.root, usedTypes);

  const imports = buildImportStatements(input.imports, usedTypes, warnings);
  const body = renderNode(input.document.root, input.imports, warnings, 2, null, input.styleTokens);

  const code = [
    imports,
    '',
    `export function ${componentName}() {`,
    '  return (',
    body,
    '  );',
    '}',
    '',
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');

  return { code, warnings };
}

export function generateJson(document: ViewDocument): string {
  return JSON.stringify(document, null, 2);
}
