import type { ViewDocument, ViewNode } from '@viewfoundry/core';

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

function renderProps(
  node: ViewNode,
  warnings: string[],
  hasChildNodes: boolean,
): string {
  const props = { ...(node.props ?? {}) };
  if (typeof props.children === 'string' && !hasChildNodes) {
    delete props.children;
  }

  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue;
    const formatted = formatPropValue(value, warnings, `${node.type}.${key}`);
    if (formatted === null) continue;
    if (typeof value === 'boolean') {
      if (value) parts.push(key);
    } else {
      parts.push(`${key}=${formatted}`);
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

function renderNode(node: ViewNode, imports: ComponentImportMap, warnings: string[], indent: number): string {
  const pad = '  '.repeat(indent);
  const hasChildNodes = Boolean(node.children && node.children.length > 0);
  const stringChild = typeof node.props?.children === 'string' && !hasChildNodes
    ? node.props.children
    : null;

  if (node.type === 'Root') {
    if (!node.children || node.children.length === 0) {
      return `${pad}<></>`;
    }
    if (node.children.length === 1) {
      return renderNode(node.children[0], imports, warnings, indent);
    }
    const children = node.children
      .map((child) => renderNode(child, imports, warnings, indent + 1))
      .join('\n');
    return `${pad}<>\n${children}\n${pad}</>`;
  }

  const importInfo = imports[node.type];
  if (!importInfo) {
    warnings.push(`Missing import for component type: ${node.type}`);
    return `${pad}{/* Missing component: ${node.type} */}`;
  }

  const propsStr = renderProps(node, warnings, hasChildNodes);
  const tag = importInfo.exportName;

  if (hasChildNodes) {
    const children = node.children!
      .map((child) => renderNode(child, imports, warnings, indent + 1))
      .join('\n');
    return `${pad}<${tag}${propsStr}>\n${children}\n${pad}</${tag}>`;
  }

  if (stringChild !== null) {
    return `${pad}<${tag}${propsStr}>${stringChild.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;
  }

  if (propsStr) {
    return `${pad}<${tag}${propsStr} />`;
  }
  return `${pad}<${tag} />`;
}

function buildImportStatements(imports: ComponentImportMap, usedTypes: Set<string>): string {
  const lines: string[] = [];
  for (const type of usedTypes) {
    if (type === 'Root') continue;
    const info = imports[type];
    if (!info) continue;
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
  const componentName = input.componentName ?? 'GeneratedView';
  const usedTypes = new Set<string>();
  collectTypes(input.document.root, usedTypes);

  const imports = buildImportStatements(input.imports, usedTypes);
  const body = renderNode(input.document.root, input.imports, warnings, 2);

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
