import type {
  ComponentRegistry,
  GridPlacement,
  StyleTokenMap,
  ValidationIssue,
  ValidationResult,
  ViewDocument,
  ViewNode,
} from './types.js';
import {
  isGridContainer,
  isPlacementInBounds,
  normalizePlacement,
  rectsOverlap,
  resolveGridTracks,
} from './grid.js';
import { collectNodeIds, walkNodes } from './nodes.js';
import { validateStyle } from './style.js';

export type ValidateDocumentOptions = {
  allowMissingComponents?: boolean;
};

function validateGridPlacementFields(
  placement: GridPlacement,
  path: string,
  issues: ValidationIssue[],
): void {
  for (const key of ['column', 'row', 'colSpan', 'rowSpan'] as const) {
    const value = placement[key];
    if (value === undefined) continue;
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
      issues.push({
        path,
        message: `Grid ${key} must be a positive integer`,
        code: 'INVALID_GRID_PLACEMENT',
      });
    }
  }
}

function validateGridChildren(parent: ViewNode, issues: ValidationIssue[]): void {
  if (!isGridContainer(parent.type) || !parent.children) return;

  const tracks = resolveGridTracks(parent);
  const placements: Array<{ id: string; rect: ReturnType<typeof normalizePlacement> }> = [];

  for (const child of parent.children) {
    if (!child.layout?.grid) {
      issues.push({
        path: `node:${child.id}`,
        message: `Child of grid container "${parent.type}" must have layout.grid placement`,
        code: 'MISSING_GRID_PLACEMENT',
      });
      continue;
    }

    const rect = normalizePlacement(child.layout.grid);
    validateGridPlacementFields(child.layout.grid, `node:${child.id}.layout.grid`, issues);
    if (!isPlacementInBounds(rect, tracks)) {
      issues.push({
        path: `node:${child.id}`,
        message: `Grid placement for "${child.type}" is out of bounds`,
        code: 'GRID_PLACEMENT_OUT_OF_BOUNDS',
      });
    }

    for (const existing of placements) {
      if (rectsOverlap(rect, existing.rect)) {
        issues.push({
          path: `node:${child.id}`,
          message: `Grid placement overlaps with node "${existing.id}"`,
          code: 'GRID_PLACEMENT_OVERLAP',
        });
      }
    }
    placements.push({ id: child.id, rect });
  }
}

export function validateGridLayout(
  document: ViewDocument,
  _registry?: ComponentRegistry,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  walkNodes(document.root, (node, parent) => {
    if (node.layout?.grid && (!parent || !isGridContainer(parent.type))) {
      issues.push({
        path: `node:${node.id}`,
        message: `layout.grid is only allowed when parent is a Grid or Row container`,
        code: 'INVALID_GRID_PARENT',
      });
    }
    if (isGridContainer(node.type)) {
      validateGridChildren(node, issues);
    }
  });

  return { valid: issues.length === 0, issues };
}

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

  walkNodes(document.root, (node, _parent) => {
    if (node.type === 'Root') return;

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

    if (node.layout?.grid) {
      validateGridPlacementFields(node.layout.grid, `node:${node.id}.layout.grid`, issues);
    }

    if (node.style) {
      const styleResult = validateStyle(node.style, `node:${node.id}.style`);
      issues.push(...styleResult.issues);
    }

    const propsStyle = node.props?.style;
    if (propsStyle && typeof propsStyle === 'object' && !Array.isArray(propsStyle)) {
      const propsStyleResult = validateStyle(
        propsStyle as StyleTokenMap,
        `node:${node.id}.props.style`,
      );
      issues.push(...propsStyleResult.issues);
    }
  });

  if (registry) {
    walkNodes(document.root, (node, parent) => {
      if (!parent || parent.type === 'Root') return;
      const parentDef = registry.get(parent.type);
      if (parentDef && !parentDef.acceptsChildren) {
        issues.push({
          path: `node:${node.id}`,
          message: `Component "${parent.type}" does not accept children`,
          code: 'PARENT_REJECTS_CHILDREN',
        });
      }
    });
  }

  const gridResult = validateGridLayout(document, registry);
  issues.push(...gridResult.issues);

  return { valid: issues.length === 0, issues };
}
