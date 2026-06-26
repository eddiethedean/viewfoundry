import { useCallback, useEffect, useRef, useState } from 'react';
import type { StyleValue } from '@viewfoundry/core';
import { findNode, getPrimarySelection, resolveStyleValue } from '@viewfoundry/core';
import {
  STYLE_FIELD_GROUPS,
  getStyleFieldsByGroup,
  isKnownStyleKey,
  type StyleFieldDef,
  type StyleFieldGroup,
} from '@viewfoundry/schema';
import { useEditorState, useEditorStore } from './EditorContext.js';

const GROUP_LABELS: Record<StyleFieldGroup, string> = {
  spacing: 'Spacing',
  size: 'Size',
  colors: 'Colors',
  typography: 'Typography',
  border: 'Border',
  layout: 'Layout',
  other: 'Other',
};

const STYLE_COMMIT_DEBOUNCE_MS = 300;

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

function StyleFieldControl({
  field,
  value,
  tokenOptions,
  styleTokens,
  onCommit,
}: {
  field: StyleFieldDef;
  value: StyleValue | undefined;
  tokenOptions: string[];
  styleTokens?: Record<string, string | number>;
  onCommit: (value: StyleValue | undefined, immediate?: boolean) => void;
}) {
  const label = field.label;
  const fieldId = `vf-style-${field.key}`;
  const isImmediate = field.kind === 'select' || field.kind === 'color' || field.kind === 'opacity';
  const [localValue, setLocalValue] = useState<StyleValue | undefined>(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value, field.key]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const scheduleCommit = useCallback(
    (next: StyleValue | undefined, immediate = false) => {
      setLocalValue(next);
      if (immediate || isImmediate) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = null;
        onCommit(next, true);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onCommit(next, true);
      }, STYLE_COMMIT_DEBOUNCE_MS);
    },
    [isImmediate, onCommit],
  );

  const flushCommit = useCallback(() => {
    if (!debounceRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    onCommit(localValue, true);
  }, [localValue, onCommit]);

  if (field.kind === 'color') {
    const displayValue = localValue;
    const isToken = typeof displayValue === 'string' && tokenOptions.includes(displayValue);
    const resolved =
      typeof displayValue === 'string'
        ? String(resolveStyleValue(displayValue, styleTokens))
        : displayValue;
    const showPicker = typeof displayValue === 'string' && !isToken && isHexColor(displayValue);
    const swatchColor =
      typeof resolved === 'string' && isHexColor(resolved)
        ? resolved
        : typeof resolved === 'string'
          ? resolved
          : '#cccccc';

    return (
      <label className="vf-field" htmlFor={`${fieldId}-text`}>
        <span className="vf-field-label">{label}</span>
        <div className="vf-style-color-row">
          {showPicker ? (
            <input
              id={`${fieldId}-picker`}
              type="color"
              value={displayValue as string}
              onChange={(e) => scheduleCommit(e.target.value, true)}
              aria-label={`${label} color picker`}
            />
          ) : (
            <span
              className="vf-style-color-swatch"
              style={{ backgroundColor: swatchColor }}
              aria-hidden="true"
            />
          )}
          <input
            id={`${fieldId}-text`}
            type="text"
            value={String(displayValue ?? '')}
            placeholder="#000000 or token"
            onChange={(e) => scheduleCommit(e.target.value || undefined)}
            onBlur={flushCommit}
          />
          {tokenOptions.length > 0 && (
            <select
              value={isToken ? String(displayValue) : ''}
              onChange={(e) => scheduleCommit(e.target.value || undefined, true)}
              aria-label={`${label} token`}
            >
              <option value="">Custom</option>
              {tokenOptions.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          )}
        </div>
      </label>
    );
  }

  if (field.kind === 'select') {
    return (
      <label className="vf-field" htmlFor={fieldId}>
        <span className="vf-field-label">{label}</span>
        <select
          id={fieldId}
          value={String(localValue ?? '')}
          onChange={(e) => scheduleCommit(e.target.value || undefined, true)}
        >
          <option value="">—</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === 'opacity') {
    const num =
      typeof localValue === 'number'
        ? localValue
        : localValue !== undefined && Number.isFinite(Number(localValue))
          ? Number(localValue)
          : undefined;
    const sliderValue = num ?? 1;
    return (
      <label className="vf-field" htmlFor={fieldId}>
        <span className="vf-field-label">{label}</span>
        <input
          id={fieldId}
          type="range"
          min={field.min ?? 0}
          max={field.max ?? 1}
          step={field.step ?? 0.05}
          value={sliderValue}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) scheduleCommit(next, true);
          }}
          aria-label={`${label} opacity`}
        />
        <span className="vf-style-opacity-value">{sliderValue}</span>
      </label>
    );
  }

  if (field.kind === 'number') {
    const display =
      localValue === undefined ? '' : Number.isFinite(Number(localValue)) ? Number(localValue) : '';
    return (
      <label className="vf-field" htmlFor={fieldId}>
        <span className="vf-field-label">{label}</span>
        <input
          id={fieldId}
          type="number"
          value={display}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => {
            if (e.target.value === '') {
              scheduleCommit(undefined);
              return;
            }
            const next = Number(e.target.value);
            if (Number.isFinite(next)) scheduleCommit(next);
          }}
          onBlur={flushCommit}
        />
      </label>
    );
  }

  return (
    <label className="vf-field" htmlFor={fieldId}>
      <span className="vf-field-label">{label}</span>
      <input
        id={fieldId}
        type="text"
        value={String(localValue ?? '')}
        placeholder="e.g. 8px"
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) {
            scheduleCommit(undefined);
            return;
          }
          const asNumber = Number(raw);
          scheduleCommit(Number.isFinite(asNumber) && /^\d+(\.\d+)?$/.test(raw) ? asNumber : raw);
        }}
        onBlur={flushCommit}
      />
    </label>
  );
}

function AdvancedStyleFields({
  style,
  onCommit,
}: {
  style: Record<string, StyleValue>;
  onCommit: (key: string, value: StyleValue | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pendingKey, setPendingKey] = useState('');
  const knownKeys = new Set(getStyleFieldsByGroup('spacing').map((f) => f.key));
  STYLE_FIELD_GROUPS.forEach((group) => {
    getStyleFieldsByGroup(group).forEach((field) => knownKeys.add(field.key));
  });
  const advancedEntries = Object.entries(style).filter(([key]) => !knownKeys.has(key));
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleCommit = (key: string, value: StyleValue | undefined, immediate = false) => {
    if (immediate) {
      const pending = debounceRef.current.get(key);
      if (pending) clearTimeout(pending);
      debounceRef.current.delete(key);
      onCommit(key, value);
      return;
    }
    const existing = debounceRef.current.get(key);
    if (existing) clearTimeout(existing);
    debounceRef.current.set(
      key,
      setTimeout(() => {
        debounceRef.current.delete(key);
        onCommit(key, value);
      }, STYLE_COMMIT_DEBOUNCE_MS),
    );
  };

  return (
    <section className="vf-style-section">
      <button
        type="button"
        className="vf-style-section-toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((open) => !open)}
      >
        Advanced
      </button>
      {expanded && (
        <div className="vf-style-advanced">
          {advancedEntries.length === 0 && (
            <p className="vf-inspector-empty">No custom style properties</p>
          )}
          {advancedEntries.map(([key, value]) => (
            <label key={key} className="vf-field">
              <span className="vf-field-label">{key}</span>
              <input
                type="text"
                value={String(value ?? '')}
                onChange={(e) => scheduleCommit(key, e.target.value || undefined)}
                onBlur={(e) => {
                  if (debounceRef.current.has(key)) {
                    scheduleCommit(key, e.target.value || undefined, true);
                  }
                }}
              />
            </label>
          ))}
          <label className="vf-field">
            <span className="vf-field-label">Add property</span>
            <input
              type="text"
              placeholder="camelCaseKey"
              value={pendingKey}
              onChange={(e) => setPendingKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const key = pendingKey.trim();
                if (!key || !/^[a-z][a-zA-Z0-9]*$/.test(key)) return;
                setPendingKey('');
              }}
            />
          </label>
        </div>
      )}
    </section>
  );
}

export type StyleInspectorProps = {
  styleTokens?: Record<string, string | number>;
};

export function StyleInspector({ styleTokens }: StyleInspectorProps) {
  const store = useEditorStore();
  const document = useEditorState((s) => s.document);
  const selection = useEditorState((s) => s.selection);
  const nodeId = getPrimarySelection(selection);
  const tokenOptions = styleTokens ? Object.keys(styleTokens) : [];

  const handleCommit = useCallback(
    (key: string, value: StyleValue | undefined) => {
      store.getState().setStyleProp(key, value);
    },
    [store],
  );

  if (!nodeId) {
    return (
      <div className="vf-inspector vf-style-inspector">
        <div className="vf-panel-header">Style</div>
        <div className="vf-inspector-empty">Select a node to edit its style</div>
      </div>
    );
  }

  const node = findNode(document.root, nodeId);
  if (!node) {
    return (
      <div className="vf-inspector vf-style-inspector">
        <div className="vf-panel-header">Style</div>
        <div className="vf-inspector-empty">Node not found</div>
      </div>
    );
  }

  const style = node.style ?? {};

  return (
    <div className="vf-inspector vf-style-inspector">
      <div className="vf-panel-header">Style</div>
      <div className="vf-inspector-meta">
        <div>
          <strong>Type:</strong> {node.type}
        </div>
        <div>
          <strong>ID:</strong> {node.id}
        </div>
      </div>
      <div className="vf-inspector-fields">
        {STYLE_FIELD_GROUPS.map((group) => {
          const fields = getStyleFieldsByGroup(group);
          return (
            <section key={group} className="vf-style-section">
              <h3 className="vf-style-section-title">{GROUP_LABELS[group]}</h3>
              {fields.map((field) => (
                <StyleFieldControl
                  key={field.key}
                  field={field}
                  value={style[field.key]}
                  tokenOptions={field.kind === 'color' ? tokenOptions : []}
                  styleTokens={styleTokens}
                  onCommit={(value) => handleCommit(field.key, value)}
                />
              ))}
            </section>
          );
        })}
        <AdvancedStyleFields style={style} onCommit={handleCommit} />
        {Object.keys(style).some((key) => !isKnownStyleKey(key)) && (
          <p className="vf-inspector-hint">Custom properties appear under Advanced.</p>
        )}
      </div>
    </div>
  );
}
