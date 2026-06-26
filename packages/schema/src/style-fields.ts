import type { StyleValue } from '@viewfoundry/core';
import {
  ALIGN_ITEMS_VALUES,
  BORDER_STYLE_VALUES,
  DISPLAY_VALUES,
  FLEX_DIRECTION_VALUES,
  JUSTIFY_CONTENT_VALUES,
  KNOWN_STYLE_KEYS,
  OVERFLOW_VALUES,
  TEXT_ALIGN_VALUES,
  validateStyle,
} from '@viewfoundry/core';

export type StyleFieldKind = 'size' | 'color' | 'number' | 'select' | 'opacity';

export type StyleFieldDef = {
  key: string;
  label: string;
  kind: StyleFieldKind;
  group: StyleFieldGroup;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
};

export type StyleFieldGroup =
  | 'spacing'
  | 'size'
  | 'colors'
  | 'typography'
  | 'border'
  | 'layout'
  | 'other';

export const STYLE_FIELD_GROUPS: StyleFieldGroup[] = [
  'spacing',
  'size',
  'colors',
  'typography',
  'border',
  'layout',
  'other',
];

export const STYLE_FIELD_DEFS: StyleFieldDef[] = [
  { key: 'margin', label: 'Margin', kind: 'size', group: 'spacing' },
  { key: 'padding', label: 'Padding', kind: 'size', group: 'spacing' },
  { key: 'gap', label: 'Gap', kind: 'size', group: 'spacing' },
  { key: 'width', label: 'Width', kind: 'size', group: 'size' },
  { key: 'height', label: 'Height', kind: 'size', group: 'size' },
  { key: 'minWidth', label: 'Min width', kind: 'size', group: 'size' },
  { key: 'maxWidth', label: 'Max width', kind: 'size', group: 'size' },
  { key: 'color', label: 'Text color', kind: 'color', group: 'colors' },
  { key: 'backgroundColor', label: 'Background', kind: 'color', group: 'colors' },
  { key: 'borderColor', label: 'Border color', kind: 'color', group: 'colors' },
  { key: 'fontSize', label: 'Font size', kind: 'size', group: 'typography' },
  { key: 'fontWeight', label: 'Font weight', kind: 'size', group: 'typography' },
  { key: 'lineHeight', label: 'Line height', kind: 'size', group: 'typography' },
  {
    key: 'textAlign',
    label: 'Text align',
    kind: 'select',
    group: 'typography',
    options: [...TEXT_ALIGN_VALUES],
  },
  { key: 'border', label: 'Border', kind: 'size', group: 'border' },
  { key: 'borderWidth', label: 'Border width', kind: 'size', group: 'border' },
  {
    key: 'borderStyle',
    label: 'Border style',
    kind: 'select',
    group: 'border',
    options: [...BORDER_STYLE_VALUES],
  },
  { key: 'borderRadius', label: 'Border radius', kind: 'size', group: 'border' },
  {
    key: 'display',
    label: 'Display',
    kind: 'select',
    group: 'layout',
    options: [...DISPLAY_VALUES],
  },
  {
    key: 'flexDirection',
    label: 'Flex direction',
    kind: 'select',
    group: 'layout',
    options: [...FLEX_DIRECTION_VALUES],
  },
  {
    key: 'alignItems',
    label: 'Align items',
    kind: 'select',
    group: 'layout',
    options: [...ALIGN_ITEMS_VALUES],
  },
  {
    key: 'justifyContent',
    label: 'Justify content',
    kind: 'select',
    group: 'layout',
    options: [...JUSTIFY_CONTENT_VALUES],
  },
  {
    key: 'opacity',
    label: 'Opacity',
    kind: 'opacity',
    group: 'other',
    min: 0,
    max: 1,
    step: 0.05,
  },
  {
    key: 'overflow',
    label: 'Overflow',
    kind: 'select',
    group: 'other',
    options: [...OVERFLOW_VALUES],
  },
];

export function getStyleFieldsByGroup(group: StyleFieldGroup): StyleFieldDef[] {
  return STYLE_FIELD_DEFS.filter((field) => field.group === group);
}

export function isKnownStyleKey(key: string): boolean {
  return KNOWN_STYLE_KEYS.has(key);
}

export function validateStyleProp(key: string, value: StyleValue | undefined) {
  if (value === undefined) {
    return { valid: true, issues: [] };
  }
  return validateStyle({ [key]: value }, `style.${key}`);
}
