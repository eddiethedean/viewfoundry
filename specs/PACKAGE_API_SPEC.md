# Package API Spec

This document describes the public API surface for ViewFoundry packages at **v0.3.x**.

## Versioning policy (0.x)

- **Package semver** (`0.3.0`, etc.) tracks npm releases. All `@viewfoundry/*` packages publish at the same version.
- **Document version** (`ViewDocument.version: '0.1'`) is separate from package semver. It identifies the JSON document schema.
- During `0.x`, minor releases may add optional document fields and APIs. Patch releases are backward compatible within the minor.
- `1.0.0` is reserved for a stable public API after grid layout, docs site, and integrations are proven.

Install all ViewFoundry packages at the **same version**:

```bash
npm install @viewfoundry/core@0.3.0 @viewfoundry/schema@0.3.0 @viewfoundry/react@0.3.0 @viewfoundry/editor@0.3.0
```

## `@viewfoundry/core`

### Types

```ts
export type ViewDocument;
export type ViewDocumentMeta;
export type ViewNode; // includes optional layout?: NodeLayout
export type GridPlacement;
export type NodeLayout;
export type PropField;
export type PropSchema;
export type ComponentDefinition;
export type ComponentRegistry;
export type SelectionState;
export type HistoryState;
export type ValidationIssue;
export type ValidationResult;
export type CommandResult<T = void>;
export type DocumentCommand;
export type ApplyCommandOptions;
// Command payloads: InsertNodePayload, DeleteNodePayload, etc.
```

### Document

```ts
export function createDocument(overrides?: Partial<ViewDocument>): ViewDocument;
export function createNode(
  type: string,
  props?: Record<string, unknown>,
  children?: ViewNode[],
  id?: string,
  layout?: NodeLayout,
): ViewNode;
export function cloneNode(node: ViewNode): ViewNode;
```

### Registry & validation

```ts
export function createRegistry(definitions?: ComponentDefinition[]): ComponentRegistry;
export function validateDocument(
  document: ViewDocument,
  registry?: ComponentRegistry,
  options?: ValidateDocumentOptions,
): ValidationResult;
export function validateGridLayout(
  document: ViewDocument,
  registry?: ComponentRegistry,
): ValidationResult;
```

### Grid helpers

```ts
export const GRID_CONTAINER_TYPES; // ['Grid', 'Row']
export function isGridContainer(type: string): boolean;
export function resolveGridTracks(node: ViewNode): GridTracks;
export function sortChildrenByGridOrder(children: ViewNode[]): ViewNode[];
export function autoPlaceNextCell(children: ViewNode[], tracks: GridTracks): GridPlacement;
export function placementToCss(placement?: GridPlacement): Record<string, string>;
export function gridDropId(parentId: string, row: number, column: number): string;
```

### Commands (low-level)

Commands return `CommandResult` — not a bare `ViewDocument`:

```ts
type CommandResult<T = void> =
  | { ok: true; document: ViewDocument; data?: T }
  | { ok: false; error: string };

export function insertNode(document: ViewDocument, payload: InsertNodePayload): CommandResult;
export function deleteNode(document: ViewDocument, payload: DeleteNodePayload): CommandResult;
export function duplicateNode(document: ViewDocument, payload: DuplicateNodePayload): CommandResult;
export function moveNode(document: ViewDocument, payload: MoveNodePayload): CommandResult;
// MoveNodePayload.layout?: GridPlacement
export function setNodeLayout(document: ViewDocument, payload: SetNodeLayoutPayload): CommandResult;
// InsertNodePayload.layout?: GridPlacement
export function updateNodeProps(
  document: ViewDocument,
  payload: UpdateNodePropsPayload,
): CommandResult;
export function setNodeProp(document: ViewDocument, payload: SetNodePropPayload): CommandResult;
```

`updateNodeProps` **replaces** the entire `props` object. `setNodeProp` merges a single key.

### Registry-aware commands (recommended)

```ts
export function applyCommand(
  document: ViewDocument,
  command: DocumentCommand,
  registry: ComponentRegistry,
  options?: ApplyCommandOptions,
): CommandResult;
```

Runs structural commands, enforces `acceptsChildren` / `allowedChildren`, and validates the result with `validateDocument`. Optional `validateNodeProps` hook for schema-backed prop checks.

### History & selection

```ts
export function createHistory(document: ViewDocument): HistoryState;
export function pushHistory(history: HistoryState, document: ViewDocument): HistoryState;
export function undo(history: HistoryState): HistoryState;
export function redo(history: HistoryState): HistoryState;
export function canUndo(history: HistoryState): boolean;
export function canRedo(history: HistoryState): boolean;

export function createSelection(): SelectionState;
export function selectNode(selection: SelectionState, nodeId: string): SelectionState;
export function toggleNodeSelection(selection: SelectionState, nodeId: string): SelectionState;
export function clearSelection(): SelectionState;
export function isNodeSelected(selection: SelectionState, nodeId: string): boolean;
export function getPrimarySelection(selection: SelectionState): string | undefined;
```

### Tree utilities (advanced)

```ts
export function findNode(root: ViewNode, nodeId: string): ViewNode | undefined;
export function findNodeLocation(root: ViewNode, nodeId: string): NodeLocation | undefined;
export function walkNodes(root: ViewNode, visitor: (node: ViewNode) => void): void;
export function collectNodeIds(root: ViewNode): string[];
export function updateNodeInTree(
  root: ViewNode,
  nodeId: string,
  updater: (node: ViewNode) => ViewNode,
): ViewNode;
export function removeNodeFromTree(root: ViewNode, nodeId: string): ViewNode;
export function insertNodeInTree(
  root: ViewNode,
  parentId: string,
  node: ViewNode,
  index?: number,
): ViewNode;
```

## `@viewfoundry/schema`

```ts
export function defineComponent(
  component: unknown,
  options: DefineComponentOptions,
): ComponentDefinition;
export function text(options?: TextFieldOptions): PropField<string>;
export function textarea(options?: TextareaFieldOptions): PropField<string>;
export function number(options?: NumberFieldOptions): PropField<number>;
export function boolean(options?: BooleanFieldOptions): PropField<boolean>;
export function select(options: SelectFieldOptions): PropField<string>;
export function radio(options: RadioFieldOptions): PropField<string>;
export function color(options?: ColorFieldOptions): PropField<string>;
export function image(options?: ImageFieldOptions): PropField<string>;
export function url(options?: UrlFieldOptions): PropField<string>;
export function json(options?: JsonFieldOptions): PropField<unknown>;
export function createDefaultProps(schema: PropSchema): Record<string, unknown>;
export function validateProps(schema: PropSchema, props: Record<string, unknown>): ValidationResult;
export function getSelectValues(
  field: SelectFieldOptions | RadioFieldOptions,
): string[] | undefined;
```

**Peer dependency:** `@viewfoundry/core@^0.3.0`

## `@viewfoundry/react`

```tsx
export function ViewFoundryProvider(props: ViewFoundryProviderProps): JSX.Element;
export function ViewRenderer(props: ViewRendererProps): JSX.Element;
export function ViewNodeRenderer(props: ViewNodeRendererProps): JSX.Element;
export function useViewDocument(): ViewDocument;
export function useViewRegistry(): ComponentRegistry;
export function useViewSelection(): SelectionState;
```

Styles: `@viewfoundry/react/styles.css` (selection overlays, missing-component fallback).

**Peer dependencies:** `@viewfoundry/core@^0.3.0`, `react`, `react-dom`

## `@viewfoundry/editor`

```tsx
export function ViewFoundryEditor(props: ViewFoundryEditorProps): JSX.Element;
export function EditorProvider(props: EditorProviderProps): JSX.Element;
export function useEditorStore(): EditorStoreApi;
export function useEditorState<T>(selector: (state: EditorStore) => T): T;
export function createEditorStore(...): EditorStoreApi;
export function resolveInsertParentId(...): string;

// Composition API (experimental in 0.x)
export function Palette(props: PaletteProps): JSX.Element;
export function Canvas(props: CanvasProps): JSX.Element;
export function Inspector(props: InspectorProps): JSX.Element;
export function LayersPanel(props: LayersPanelProps): JSX.Element;
export function Toolbar(props: ToolbarProps): JSX.Element;
```

Styles: `@viewfoundry/editor/styles.css` **and** `@viewfoundry/react/styles.css` when using the full editor.

**Peer dependencies:** `@viewfoundry/core@^0.3.0`, `@viewfoundry/react@^0.3.0`, `@viewfoundry/schema@^0.3.0`, `react`, `react-dom`

## `@viewfoundry/codegen`

```ts
export function generateTsx(input: CodegenInput): CodegenOutput;
export function generateJson(document: ViewDocument): string;
```

Sanitizes `componentName`, import paths, export names, and prop keys. Emits warnings for rejected values.

**Peer dependency:** `@viewfoundry/core@^0.3.0`

## `@viewfoundry/cli`

```ts
export function runCli(argv: string[]): RunCliResult;
export function printHelp(): void;
export function loadDocument(path: string): ViewDocument;
```

Bin: `viewfoundry` — `export`, `validate`, `init` (stub).

## `@viewfoundry/vite`

**Stub.** `viewfoundry()` returns a no-op plugin until v0.5.0.

```ts
export function viewfoundry(options?: ViewFoundryViteOptions): Plugin;
```

**Peer dependency:** `vite@^5 || ^6`
