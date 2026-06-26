import type { StyleTokenMap, StyleValue, ValidationIssue, ValidationResult } from './types.js';

export const KNOWN_STYLE_KEYS = new Set([
  'margin',
  'padding',
  'gap',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'color',
  'backgroundColor',
  'borderColor',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'textAlign',
  'border',
  'borderWidth',
  'borderStyle',
  'borderRadius',
  'display',
  'flexDirection',
  'alignItems',
  'justifyContent',
  'opacity',
  'overflow',
]);

export const DISPLAY_VALUES = new Set([
  'block',
  'inline',
  'inline-block',
  'flex',
  'grid',
  'none',
  'contents',
]);

export const FLEX_DIRECTION_VALUES = new Set(['row', 'row-reverse', 'column', 'column-reverse']);
export const ALIGN_ITEMS_VALUES = new Set([
  'flex-start',
  'flex-end',
  'center',
  'baseline',
  'stretch',
]);
export const JUSTIFY_CONTENT_VALUES = new Set([
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
]);
export const TEXT_ALIGN_VALUES = new Set(['left', 'right', 'center', 'justify', 'start', 'end']);
export const OVERFLOW_VALUES = new Set(['visible', 'hidden', 'scroll', 'auto', 'clip']);
export const BORDER_STYLE_VALUES = new Set([
  'none',
  'solid',
  'dashed',
  'dotted',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
]);

const CAMEL_CASE_KEY = /^[a-z][a-zA-Z0-9]*$/;
const COLOR_PATTERN =
  /^(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)|[a-zA-Z]+)$/;
const TOKEN_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]*$/;

export function cloneStyle(style: StyleTokenMap): StyleTokenMap {
  return { ...style };
}

function isTokenReference(value: StyleValue): boolean {
  return typeof value === 'string' && value.includes('.') && TOKEN_PATTERN.test(value);
}

function isValidColor(value: string): boolean {
  return COLOR_PATTERN.test(value.trim());
}

function isValidSizeValue(value: string | number): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  const trimmed = value.trim();
  if (trimmed === 'auto' || trimmed === 'inherit' || trimmed === 'initial') return true;
  return /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|ch|ex|fr|vmin|vmax)?$/.test(trimmed);
}

function validateStyleValue(key: string, value: StyleValue, path: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (value === null || value === undefined) {
    issues.push({
      path,
      message: `Style value for "${key}" cannot be null`,
      code: 'INVALID_STYLE_VALUE',
    });
    return issues;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      issues.push({
        path,
        message: `Style value for "${key}" must be a finite number`,
        code: 'INVALID_STYLE_VALUE',
      });
    }
    if (key === 'opacity' && (value < 0 || value > 1)) {
      issues.push({
        path,
        message: 'opacity must be between 0 and 1',
        code: 'INVALID_STYLE_VALUE',
      });
    }
    return issues;
  }

  if (typeof value !== 'string') {
    issues.push({
      path,
      message: `Style value for "${key}" must be a string or number`,
      code: 'INVALID_STYLE_VALUE',
    });
    return issues;
  }

  if (isTokenReference(value)) return issues;

  switch (key) {
    case 'color':
    case 'backgroundColor':
    case 'borderColor':
      if (!isValidColor(value)) {
        issues.push({
          path,
          message: `Invalid color value for "${key}": ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'opacity': {
      const num = Number(value);
      if (!Number.isFinite(num) || num < 0 || num > 1) {
        issues.push({
          path,
          message: 'opacity must be between 0 and 1',
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    }
    case 'display':
      if (!DISPLAY_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid display value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'flexDirection':
      if (!FLEX_DIRECTION_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid flexDirection value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'alignItems':
      if (!ALIGN_ITEMS_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid alignItems value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'justifyContent':
      if (!JUSTIFY_CONTENT_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid justifyContent value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'textAlign':
      if (!TEXT_ALIGN_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid textAlign value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'overflow':
      if (!OVERFLOW_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid overflow value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'borderStyle':
      if (!BORDER_STYLE_VALUES.has(value)) {
        issues.push({
          path,
          message: `Invalid borderStyle value: ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    case 'margin':
    case 'padding':
    case 'gap':
    case 'width':
    case 'height':
    case 'minWidth':
    case 'maxWidth':
    case 'fontSize':
    case 'fontWeight':
    case 'lineHeight':
    case 'border':
    case 'borderWidth':
    case 'borderRadius':
      if (!isValidSizeValue(value)) {
        issues.push({
          path,
          message: `Invalid size value for "${key}": ${value}`,
          code: 'INVALID_STYLE_VALUE',
        });
      }
      break;
    default:
      break;
  }

  return issues;
}

export function validateStyle(style: StyleTokenMap, pathPrefix = 'style'): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const [key, value] of Object.entries(style)) {
    const path = `${pathPrefix}.${key}`;
    if (!key || !CAMEL_CASE_KEY.test(key)) {
      issues.push({
        path,
        message: `Invalid style key: ${key}`,
        code: 'INVALID_STYLE_KEY',
      });
      continue;
    }
    if (!KNOWN_STYLE_KEYS.has(key) && !CAMEL_CASE_KEY.test(key)) {
      issues.push({
        path,
        message: `Unknown style key: ${key}`,
        code: 'UNKNOWN_STYLE_KEY',
      });
    }
    issues.push(...validateStyleValue(key, value, path));
  }

  return { valid: issues.length === 0, issues };
}

export function resolveStyleValue(
  value: StyleValue,
  tokens?: Record<string, string | number>,
): string | number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && isTokenReference(value) && tokens?.[value] !== undefined) {
    return tokens[value];
  }
  return value;
}
