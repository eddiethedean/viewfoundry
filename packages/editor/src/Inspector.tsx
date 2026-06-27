import type { PropField } from '@viewfoundry/core';
import { findNode, getPrimarySelection } from '@viewfoundry/core';
import { getSelectValues } from '@viewfoundry/schema';
import { useEditorState, useEditorStore } from './EditorContext.js';
import { SelectedNodeActions } from './SelectedNodeActions.js';

function FieldControl({
  name,
  field,
  value,
  onChange,
}: {
  name: string;
  field: PropField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const label = field.label ?? name;

  switch (field.kind) {
    case 'text':
    case 'url':
    case 'color':
    case 'image':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type={field.kind === 'color' ? 'color' : field.kind === 'url' ? 'url' : 'text'}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    case 'textarea':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <textarea
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
          />
        </label>
      );
    case 'number':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="number"
            value={value === undefined ? '' : Number(value)}
            min={field.min as number | undefined}
            max={field.max as number | undefined}
            step={field.step as number | undefined}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </label>
      );
    case 'boolean':
      return (
        <label className="vf-field vf-field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="vf-field-label">{label}</span>
        </label>
      );
    case 'select':
    case 'radio': {
      const options = getSelectValues(field as PropField<string>) ?? [];
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'json':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <textarea
            value={JSON.stringify(value ?? null, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // ignore invalid JSON while typing
              }
            }}
            rows={6}
          />
        </label>
      );
    default:
      return (
        <div className="vf-field vf-field-unknown">
          <span className="vf-field-label">{label}</span>
          <span className="vf-field-warning">Unsupported field type: {field.kind}</span>
        </div>
      );
  }
}

export type InspectorProps = Record<string, never>;

export function Inspector(_props: InspectorProps) {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const registry = useEditorState((s) => s.registry);
  const selection = useEditorState((s) => s.selection);
  const nodeId = getPrimarySelection(selection);

  if (!nodeId) {
    return (
      <div className="vf-inspector">
        <div className="vf-panel-header">Inspector</div>
        <div className="vf-inspector-empty">Select a node to edit its properties</div>
      </div>
    );
  }

  const node = findNode(document.root, nodeId);
  if (!node) {
    return (
      <div className="vf-inspector">
        <div className="vf-panel-header">Inspector</div>
        <div className="vf-inspector-empty">Node not found</div>
      </div>
    );
  }

  const def = registry.get(node.type);
  const schema = def?.props ?? {};

  return (
    <div className="vf-inspector">
      <div className="vf-panel-header">Inspector</div>
      <SelectedNodeActions />
      <div className="vf-inspector-meta">
        <div>
          <strong>Type:</strong> {node.type}
        </div>
        <div>
          <strong>ID:</strong> {node.id}
        </div>
      </div>
      {!def && (
        <div className="vf-inspector-warning">No schema registered for this component type</div>
      )}
      <div className="vf-inspector-fields">
        {Object.entries(schema).map(([key, field]) =>
          field ? (
            <FieldControl
              key={key}
              name={key}
              field={field}
              value={node.props?.[key] ?? field.defaultValue}
              onChange={(value) => store.getState().updateProp(key, value)}
            />
          ) : null,
        )}
        {Object.keys(schema).length === 0 && (
          <div className="vf-inspector-empty">No editable properties</div>
        )}
      </div>
    </div>
  );
}
