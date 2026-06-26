import { useState } from 'react';
import type { StyleValue } from '@viewfoundry/core';
import { findNode, getPrimarySelection } from '@viewfoundry/core';
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

function StyleFieldControl({
  field,
  value,
  tokenOptions,
  onChange,
}: {
  field: StyleFieldDef;
  value: StyleValue | undefined;
  tokenOptions: string[];
  onChange: (value: StyleValue | undefined) => void;
}) {
  const label = field.label;

  if (field.kind === 'color') {
    const isToken = typeof value === 'string' && tokenOptions.includes(value);
    const colorValue =
      typeof value === 'string' && !isToken && value.startsWith('#') ? value : '#000000';
    return (
      <label className="vf-field">
        <span className="vf-field-label">{label}</span>
        <div className="vf-style-color-row">
          <input
            type="color"
            value={colorValue}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color picker`}
          />
          <input
            type="text"
            value={String(value ?? '')}
            placeholder="#000000 or token"
            onChange={(e) => onChange(e.target.value || undefined)}
          />
          {tokenOptions.length > 0 && (
            <select
              value={isToken ? String(value) : ''}
              onChange={(e) => onChange(e.target.value || undefined)}
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
      <label className="vf-field">
        <span className="vf-field-label">{label}</span>
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value || undefined)}>
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
    const num = typeof value === 'number' ? value : value ? Number(value) : undefined;
    return (
      <label className="vf-field">
        <span className="vf-field-label">{label}</span>
        <input
          type="range"
          min={field.min ?? 0}
          max={field.max ?? 1}
          step={field.step ?? 0.05}
          value={num ?? 1}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="vf-style-opacity-value">{num ?? 1}</span>
      </label>
    );
  }

  if (field.kind === 'number') {
    return (
      <label className="vf-field">
        <span className="vf-field-label">{label}</span>
        <input
          type="number"
          value={value === undefined ? '' : Number(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </label>
    );
  }

  return (
    <label className="vf-field">
      <span className="vf-field-label">{label}</span>
      <input
        type="text"
        value={String(value ?? '')}
        placeholder="e.g. 8px"
        onChange={(e) => {
          const raw = e.target.value;
          if (!raw) {
            onChange(undefined);
            return;
          }
          const asNumber = Number(raw);
          onChange(Number.isFinite(asNumber) && /^\d+(\.\d+)?$/.test(raw) ? asNumber : raw);
        }}
      />
    </label>
  );
}

function AdvancedStyleFields({
  style,
  onChange,
}: {
  style: Record<string, StyleValue>;
  onChange: (key: string, value: StyleValue | undefined) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const knownKeys = new Set(getStyleFieldsByGroup('spacing').map((f) => f.key));
  STYLE_FIELD_GROUPS.forEach((group) => {
    getStyleFieldsByGroup(group).forEach((field) => knownKeys.add(field.key));
  });
  const advancedEntries = Object.entries(style).filter(([key]) => !knownKeys.has(key));

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
                onChange={(e) => onChange(key, e.target.value || undefined)}
              />
            </label>
          ))}
          <label className="vf-field">
            <span className="vf-field-label">Add property</span>
            <input
              type="text"
              placeholder="camelCaseKey"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const input = e.currentTarget;
                const key = input.value.trim();
                if (!key || !/^[a-z][a-zA-Z0-9]*$/.test(key)) return;
                onChange(key, '');
                input.value = '';
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

  const handleChange = (key: string, value: StyleValue | undefined) => {
    store.getState().setStyleProp(key, value);
  };

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
                  onChange={(value) => handleChange(field.key, value)}
                />
              ))}
            </section>
          );
        })}
        <AdvancedStyleFields style={style} onChange={handleChange} />
        {Object.keys(style).some((key) => !isKnownStyleKey(key)) && (
          <p className="vf-inspector-hint">Custom properties appear under Advanced.</p>
        )}
      </div>
    </div>
  );
}
