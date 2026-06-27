import type { PropField } from '@viewfoundry/core';
import { getSelectValues } from '@viewfoundry/schema';
import { extractJsxProps } from '@viewfoundry/sync';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

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
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="text"
            value={String(value ?? '')}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
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
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {(getSelectValues(field as PropField<string>) ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    case 'number':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="number"
            value={value === undefined ? '' : Number(value)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </label>
      );
    default:
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
  }
}

export function CodeFirstPropertiesPanel() {
  const store = useCodeFirstStore();
  const parsed = useCodeFirstState((s) => s.parsed);
  const selectedElementId = useCodeFirstState((s) => s.selectedElementId);
  const registry = useCodeFirstState((s) => s.registry);

  if (!selectedElementId || !parsed) {
    return (
      <section className="vf-inspector" aria-label="Properties">
        <p className="vf-inspector-empty">Select an element on the Stage or in Elements</p>
      </section>
    );
  }

  const element = parsed.elements.get(selectedElementId);
  if (!element) {
    return (
      <section className="vf-inspector" aria-label="Properties">
        <p className="vf-inspector-empty">Element not found in source</p>
      </section>
    );
  }

  const def = registry.get(element.tagName);
  const propsSchema = def?.props ?? {};
  const liveProps = extractJsxProps(parsed.content, element);
  const defaultProps = def?.defaultProps ?? {};

  return (
    <section className="vf-inspector" aria-label="Properties">
      <header className="vf-panel-header">
        <h2>Properties</h2>
        <span className="vf-inspector-type">{def?.label ?? element.tagName}</span>
      </header>
      <div className="vf-inspector-fields">
        {Object.entries(propsSchema).map(([key, field]) => (
          <FieldControl
            key={key}
            name={key}
            field={field}
            value={liveProps[key] ?? defaultProps[key as keyof typeof defaultProps]}
            onChange={(value) => store.getState().updateProp(key, value)}
          />
        ))}
        {Object.keys(propsSchema).length === 0 && (
          <p className="vf-inspector-empty">No schema props for {element.tagName}</p>
        )}
      </div>
    </section>
  );
}
