# Package API Spec

## `@viewfoundry/core`

Exports:

```ts
export type ViewDocument;
export type ViewNode;
export type ComponentDefinition;
export type ComponentRegistry;
export type SelectionState;
export type HistoryState;

export function createDocument(): ViewDocument;
export function createNode(type: string, props?: Record<string, unknown>, children?: ViewNode[]): ViewNode;
export function createRegistry(definitions?: ComponentDefinition[]): ComponentRegistry;
export function validateDocument(document: ViewDocument, registry?: ComponentRegistry): ValidationResult;

export function insertNode(document: ViewDocument, payload: InsertNodePayload): ViewDocument;
export function deleteNode(document: ViewDocument, payload: DeleteNodePayload): ViewDocument;
export function duplicateNode(document: ViewDocument, payload: DuplicateNodePayload): ViewDocument;
export function moveNode(document: ViewDocument, payload: MoveNodePayload): ViewDocument;
export function updateNodeProps(document: ViewDocument, payload: UpdateNodePropsPayload): ViewDocument;
export function setNodeProp(document: ViewDocument, payload: SetNodePropPayload): ViewDocument;

export function createHistory(document: ViewDocument): HistoryState;
export function pushHistory(history: HistoryState, document: ViewDocument): HistoryState;
export function undo(history: HistoryState): HistoryState;
export function redo(history: HistoryState): HistoryState;
```

## `@viewfoundry/schema`

Exports:

```ts
export function defineComponent(component: unknown, options: DefineComponentOptions): ComponentDefinition;
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
```

## `@viewfoundry/react`

Exports:

```tsx
export function ViewFoundryProvider(props: ViewFoundryProviderProps): JSX.Element;
export function ViewRenderer(props: ViewRendererProps): JSX.Element;
export function ViewNodeRenderer(props: ViewNodeRendererProps): JSX.Element;
export function useViewDocument(): ViewDocument;
export function useViewRegistry(): ComponentRegistry;
export function useViewSelection(): SelectionState;
```

## `@viewfoundry/editor`

Exports:

```tsx
export function ViewFoundryEditor(props: ViewFoundryEditorProps): JSX.Element;
export function Palette(props: PaletteProps): JSX.Element;
export function Canvas(props: CanvasProps): JSX.Element;
export function Inspector(props: InspectorProps): JSX.Element;
export function LayersPanel(props: LayersPanelProps): JSX.Element;
export function Toolbar(props: ToolbarProps): JSX.Element;
```

## `@viewfoundry/codegen`

Exports:

```ts
export function generateTsx(input: CodegenInput): CodegenOutput;
export function generateJson(document: ViewDocument): string;
```
