import {
  deleteNode,
  duplicateNode,
  insertNode,
  moveNode,
  setNodeProp,
  updateNodeProps,
} from './commands.js';
import { findNode, findNodeLocation } from './nodes.js';
import type {
  CommandResult,
  ComponentRegistry,
  DeleteNodePayload,
  DuplicateNodePayload,
  InsertNodePayload,
  MoveNodePayload,
  SetNodePropPayload,
  UpdateNodePropsPayload,
  ValidationResult,
  ViewDocument,
  ViewNode,
} from './types.js';
import { validateDocument } from './validation.js';

export type DocumentCommand =
  | { type: 'insertNode'; payload: InsertNodePayload }
  | { type: 'deleteNode'; payload: DeleteNodePayload }
  | { type: 'duplicateNode'; payload: DuplicateNodePayload }
  | { type: 'moveNode'; payload: MoveNodePayload }
  | { type: 'updateNodeProps'; payload: UpdateNodePropsPayload }
  | { type: 'setNodeProp'; payload: SetNodePropPayload };

export type ApplyCommandOptions = {
  /** Validates node props after prop-mutating commands. */
  validateNodeProps?: (node: ViewNode) => ValidationResult;
};

function validationFailure(issues: ValidationResult['issues']): CommandResult {
  const first = issues[0];
  return { ok: false, error: first?.message ?? 'Validation failed' };
}

function canAcceptChild(
  registry: ComponentRegistry,
  parentId: string,
  childType: string,
  document: ViewDocument,
): CommandResult | null {
  const parent = findNode(document.root, parentId);
  if (!parent) {
    return { ok: false, error: `Parent node not found: ${parentId}` };
  }

  const parentDef = registry.get(parent.type);
  if (parentDef && !parentDef.acceptsChildren) {
    return { ok: false, error: `Component "${parent.type}" does not accept children` };
  }

  if (parentDef?.allowedChildren && !parentDef.allowedChildren.includes(childType)) {
    return {
      ok: false,
      error: `Component "${childType}" is not allowed as child of "${parent.type}"`,
    };
  }

  if (!registry.has(childType)) {
    return { ok: false, error: `Unknown component type: ${childType}` };
  }

  return null;
}

function validateCommandResult(
  document: ViewDocument,
  registry: ComponentRegistry,
  options?: ApplyCommandOptions,
  nodeIdForProps?: string,
): CommandResult {
  const structural = validateDocument(document, registry);
  if (!structural.valid) {
    return validationFailure(structural.issues);
  }

  if (options?.validateNodeProps && nodeIdForProps) {
    const node = findNode(document.root, nodeIdForProps);
    if (node) {
      const propsResult = options.validateNodeProps(node);
      if (!propsResult.valid) {
        return validationFailure(propsResult.issues);
      }
    }
  }

  return { ok: true, document };
}

export function applyCommand(
  document: ViewDocument,
  command: DocumentCommand,
  registry: ComponentRegistry,
  options?: ApplyCommandOptions,
): CommandResult {
  switch (command.type) {
    case 'insertNode': {
      const childError = canAcceptChild(
        registry,
        command.payload.parentId,
        command.payload.node.type,
        document,
      );
      if (childError) return childError;

      const result = insertNode(document, command.payload);
      if (!result.ok) return result;

      return validateCommandResult(result.document, registry);
    }
    case 'deleteNode': {
      const result = deleteNode(document, command.payload);
      if (!result.ok) return result;
      return validateCommandResult(result.document, registry);
    }
    case 'duplicateNode': {
      const location = findNodeLocation(document.root, command.payload.nodeId);
      if (!location) {
        return { ok: false, error: `Node not found: ${command.payload.nodeId}` };
      }
      if (!location.parent) {
        return { ok: false, error: 'Cannot duplicate root node' };
      }

      const childError = canAcceptChild(registry, location.parent.id, location.node.type, document);
      if (childError) return childError;

      const result = duplicateNode(document, command.payload);
      if (!result.ok) return result;
      return validateCommandResult(result.document, registry);
    }
    case 'moveNode': {
      const node = findNode(document.root, command.payload.nodeId);
      if (!node) {
        return { ok: false, error: `Node not found: ${command.payload.nodeId}` };
      }

      const childError = canAcceptChild(registry, command.payload.parentId, node.type, document);
      if (childError) return childError;

      const result = moveNode(document, command.payload);
      if (!result.ok) return result;
      return validateCommandResult(result.document, registry);
    }
    case 'updateNodeProps': {
      const result = updateNodeProps(document, command.payload);
      if (!result.ok) return result;
      return validateCommandResult(result.document, registry, options, command.payload.nodeId);
    }
    case 'setNodeProp': {
      const result = setNodeProp(document, command.payload);
      if (!result.ok) return result;
      return validateCommandResult(result.document, registry, options, command.payload.nodeId);
    }
    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}
