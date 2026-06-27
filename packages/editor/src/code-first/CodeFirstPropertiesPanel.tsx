import { useCallback, useEffect, useRef, useState } from 'react';
import type { PropField } from '@viewfoundry/core';
import { getSelectValues } from '@viewfoundry/schema';
import { extractJsxProps } from '@viewfoundry/sync';
import { useCodeFirstState, useCodeFirstStore } from './CodeFirstContext.js';

const TEXT_DEBOUNCE_MS = 300;

function FieldControl({
  name,
  field,
  value,
  onCommit,
}: {
  name: string;
  field: PropField;
  value: unknown;
  onCommit: (value: unknown) => void;
}) {
  const label = field.label ?? name;
  const [local, setLocal] = useState<unknown>(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const scheduleTextCommit = useCallback(
    (next: unknown) => {
      setLocal(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onCommit(next), TEXT_DEBOUNCE_MS);
    },
    [onCommit],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  switch (field.kind) {
    case 'text':
    case 'url':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="text"
            value={String(local ?? '')}
            aria-label={label}
            onChange={(e) => scheduleTextCommit(e.target.value)}
            onBlur={(e) => onCommit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value);
            }}
          />
        </label>
      );
    case 'boolean':
      return (
        <label className="vf-field vf-field-checkbox">
          <input
            type="checkbox"
            checked={Boolean(local)}
            onChange={(e) => {
              setLocal(e.target.checked);
              onCommit(e.target.checked);
            }}
          />
          <span className="vf-field-label">{label}</span>
        </label>
      );
    case 'select':
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <select
            value={String(local ?? '')}
            onChange={(e) => {
              setLocal(e.target.value);
              onCommit(e.target.value);
            }}
          >
            {(getSelectValues(field as PropField<string>) ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    case 'number': {
      const display = local === undefined ? '' : Number(local);
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="number"
            value={display}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                setLocal(undefined);
                return;
              }
              const num = Number(raw);
              if (!Number.isNaN(num)) setLocal(num);
            }}
            onBlur={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                onCommit(undefined);
                return;
              }
              const num = Number(raw);
              if (!Number.isNaN(num)) onCommit(num);
            }}
          />
        </label>
      );
    }
    default:
      return (
        <label className="vf-field">
          <span className="vf-field-label">{label}</span>
          <input
            type="text"
            value={String(local ?? '')}
            onChange={(e) => scheduleTextCommit(e.target.value)}
            onBlur={(e) => onCommit(e.target.value)}
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

  const commitProp = useCallback(
    (key: string, value: unknown) => {
      store.getState().updateProp(key, value);
    },
    [store],
  );

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
        {Object.entries(propsSchema).map(([key, field]) =>
          field ? (
            <FieldControl
              key={key}
              name={key}
              field={field as PropField}
              value={liveProps[key] ?? defaultProps[key as keyof typeof defaultProps]}
              onCommit={(value) => commitProp(key, value)}
            />
          ) : null,
        )}
        {Object.keys(propsSchema).length === 0 && (
          <p className="vf-inspector-empty">No schema props for {element.tagName}</p>
        )}
      </div>
    </section>
  );
}
