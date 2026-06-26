export type ViewDocumentMeta = {
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ViewDocument = {
  version: '0.1';
  root: ViewNode;
  meta?: ViewDocumentMeta;
};

export type ViewNode = {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  children?: ViewNode[];
};

export type PropField<TValue = unknown> = {
  kind: string;
  label?: string;
  description?: string;
  defaultValue?: TValue;
  required?: boolean;
  hidden?: boolean;
  [key: string]: unknown;
};

export type PropSchema<TProps = Record<string, unknown>> = {
  [K in keyof TProps]?: PropField<TProps[K]>;
};

export type ComponentDefinition<TProps = Record<string, unknown>> = {
  type: string;
  label?: string;
  description?: string;
  category?: string;
  component: unknown;
  props?: PropSchema<TProps>;
  defaultProps?: Partial<TProps>;
  acceptsChildren?: boolean;
  allowedChildren?: string[];
};

export type ComponentRegistry = {
  register(definition: ComponentDefinition): void;
  get(type: string): ComponentDefinition | undefined;
  has(type: string): boolean;
  list(): ComponentDefinition[];
  byCategory(): Record<string, ComponentDefinition[]>;
};

export type SelectionState = {
  selectedNodeIds: string[];
};

export type HistoryState = {
  past: ViewDocument[];
  present: ViewDocument;
  future: ViewDocument[];
};

export type ValidationIssue = {
  path: string;
  message: string;
  code: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type InsertNodePayload = {
  parentId: string;
  index?: number;
  node: ViewNode;
};

export type DeleteNodePayload = {
  nodeId: string;
};

export type DuplicateNodePayload = {
  nodeId: string;
};

export type MoveNodePayload = {
  nodeId: string;
  parentId: string;
  index: number;
};

export type UpdateNodePropsPayload = {
  nodeId: string;
  props: Record<string, unknown>;
};

export type SetNodePropPayload = {
  nodeId: string;
  key: string;
  value: unknown;
};

export type CommandResult<T = void> =
  | { ok: true; document: ViewDocument; data?: T }
  | { ok: false; error: string };
