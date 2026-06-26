import type { ComponentRegistry, ValidationIssue, ValidationResult, ViewDocument } from './types.js';
import { collectNodeIds, walkNodes } from './nodes.js';

export type ValidateDocumentOptions = {
  allowMissingComponents?: boolean;
};

export function validateDocument(
  document: ViewDocument,
  registry?: ComponentRegistry,
  options: ValidateDocumentOptions = {},
): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (document.version !== '0.1') {
    issues.push({
      path: 'version',
      message: `Unsupported document version: ${document.version}`,
      code: 'INVALID_VERSION',
    });
  }

  if (!document.root) {
    issues.push({
      path: 'root',
      message: 'Document must have a root node',
      code: 'MISSING_ROOT',
    });
    return { valid: false, issues };
  }

  const ids = collectNodeIds(document.root);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({
        path: `node:${id}`,
        message: `Duplicate node ID: ${id}`,
        code: 'DUPLICATE_NODE_ID',
      });
    }
    seen.add(id);
  }

  walkNodes(document.root, (node) => {
    if (registry && !options.allowMissingComponents && !registry.has(node.type)) {
      issues.push({
        path: `node:${node.id}`,
        message: `Unknown component type: ${node.type}`,
        code: 'UNKNOWN_COMPONENT_TYPE',
      });
    }

    if (registry) {
      const def = registry.get(node.type);
      if (def?.allowedChildren && node.children) {
        for (const child of node.children) {
          if (!def.allowedChildren.includes(child.type)) {
            issues.push({
              path: `node:${child.id}`,
              message: `Component "${child.type}" is not allowed as child of "${node.type}"`,
              code: 'INVALID_CHILD_TYPE',
            });
          }
        }
      }
    }
  });

  return { valid: issues.length === 0, issues };
}
