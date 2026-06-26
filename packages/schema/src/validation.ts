import type { PropSchema, ValidationIssue, ValidationResult } from '@viewfoundry/core';
import { getSelectValues } from './fields.js';

export function createDefaultProps(schema: PropSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema)) {
    if (field && 'defaultValue' in field && field.defaultValue !== undefined) {
      defaults[key] = field.defaultValue;
    }
  }
  return defaults;
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function testPattern(
  pattern: string,
  value: string,
  path: string,
  issues: ValidationIssue[],
): boolean {
  try {
    if (!new RegExp(pattern).test(value)) {
      issues.push({
        path,
        message: `Value does not match pattern`,
        code: 'PATTERN',
      });
      return false;
    }
    return true;
  } catch {
    issues.push({
      path,
      message: `Invalid validation pattern`,
      code: 'INVALID_PATTERN',
    });
    return false;
  }
}

export function validateProps(
  schema: PropSchema,
  props: Record<string, unknown>,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const [key, field] of Object.entries(schema)) {
    if (!field) continue;
    const value = props[key];
    const path = `props.${key}`;

    if (field.required && isEmpty(value)) {
      issues.push({
        path,
        message: `${field.label ?? key} is required`,
        code: 'REQUIRED',
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    if (field.kind === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        issues.push({
          path,
          message: `${field.label ?? key} must be a finite number`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      const min = field.min as number | undefined;
      const max = field.max as number | undefined;
      if (min !== undefined && value < min) {
        issues.push({
          path,
          message: `Value must be at least ${min}`,
          code: 'MIN',
        });
      }
      if (max !== undefined && value > max) {
        issues.push({
          path,
          message: `Value must be at most ${max}`,
          code: 'MAX',
        });
      }
    }

    if (field.kind === 'boolean' && typeof value !== 'boolean') {
      issues.push({
        path,
        message: `${field.label ?? key} must be true or false`,
        code: 'INVALID_TYPE',
      });
    }

    if (field.kind === 'select' || field.kind === 'radio') {
      if (typeof value !== 'string') {
        issues.push({
          path,
          message: `${field.label ?? key} must be a string option`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      const allowed = getSelectValues(field as Parameters<typeof getSelectValues>[0]);
      if (allowed && !allowed.includes(value)) {
        issues.push({
          path,
          message: `Invalid option: ${value}`,
          code: 'INVALID_OPTION',
        });
      }
    }

    if (
      field.kind === 'text' ||
      field.kind === 'textarea' ||
      field.kind === 'url' ||
      field.kind === 'color' ||
      field.kind === 'image'
    ) {
      if (typeof value !== 'string') {
        issues.push({
          path,
          message: `${field.label ?? key} must be text`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      const pattern = field.pattern as string | undefined;
      if (pattern) {
        testPattern(pattern, value, path, issues);
      }
    }

    if (field.kind === 'json') {
      if (
        typeof value === 'function' ||
        typeof value === 'symbol' ||
        typeof value === 'undefined'
      ) {
        issues.push({
          path,
          message: `${field.label ?? key} must be JSON-serializable`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      try {
        JSON.stringify(value);
      } catch {
        issues.push({
          path,
          message: `${field.label ?? key} must be JSON-serializable`,
          code: 'INVALID_TYPE',
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}
