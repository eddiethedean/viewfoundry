/** Source span in a TSX/JSX file (character offsets, 0-based). */
export type SourceLocation = {
  file: string;
  start: number;
  end: number;
  line: number;
  column: number;
};

/** Stable id for a JSX element within a parsed file. */
export type SourceElementId = string;

export type SourceSelection = {
  file: string;
  elementId: SourceElementId;
  location: SourceLocation;
};

export type FilePatch = {
  file: string;
  content: string;
};

export type FileCommandResult<T = void> =
  | { ok: true; patches: FilePatch[]; data?: T }
  | { ok: false; error: string };

export type InsertJsxElementPayload = {
  file: string;
  parentElementId: SourceElementId;
  index?: number;
  jsx: string;
  importPath?: string;
  importName?: string;
};

export type DeleteJsxElementPayload = {
  file: string;
  elementId: SourceElementId;
};

export type MoveJsxElementPayload = {
  file: string;
  elementId: SourceElementId;
  parentElementId: SourceElementId;
  index: number;
};

export type UpdateJsxPropPayload = {
  file: string;
  elementId: SourceElementId;
  propName: string;
  value: unknown;
};

export type ReorderJsxChildrenPayload = {
  file: string;
  parentElementId: SourceElementId;
  elementIds: SourceElementId[];
};

export type FileCommand =
  | { type: 'insertJsxElement'; payload: InsertJsxElementPayload }
  | { type: 'deleteJsxElement'; payload: DeleteJsxElementPayload }
  | { type: 'moveJsxElement'; payload: MoveJsxElementPayload }
  | { type: 'updateJsxProp'; payload: UpdateJsxPropPayload }
  | { type: 'reorderJsxChildren'; payload: ReorderJsxChildrenPayload };

export type FileHistoryState = {
  past: Record<string, string>[];
  present: Record<string, string>;
  future: Record<string, string>[];
};
