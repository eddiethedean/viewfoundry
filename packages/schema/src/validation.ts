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

export function validateProps(
  schema: PropSchema,
  props: Record<string, unknown>,
): ValidationResult {
  const issues: ValidationIssue[] = [];

  for (const [key, field] of Object.entries(schema)) {
    if (!field) continue;
    const value = props[key];

    if (field.required && isEmpty(value)) {
      issues.push({
        path: `props.${key}`,
        message: `${field.label ?? key} is required`,
        code: 'REQUIRED',
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    if (field.kind === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        issues.push({
          path: `props.${key}`,
          message: `${field.label ?? key} must be a finite number`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      const min = field.min as number | undefined;
      const max = field.max as number | undefined;
      if (min !== undefined && value < min) {
        issues.push({
          path: `props.${key}`,
          message: `Value must be at least ${min}`,
          code: 'MIN',
        });
      }
      if (max !== undefined && value > max) {
        issues.push({
          path: `props.${key}`,
          message: `Value must be at most ${max}`,
          code: 'MAX',
        });
      }
    }

    if (field.kind === 'boolean' && typeof value !== 'boolean') {
      issues.push({
        path: `props.${key}`,
        message: `${field.label ?? key} must be true or false`,
        code: 'INVALID_TYPE',
      });
    }

    if ((field.kind === 'select' || field.kind === 'radio') && typeof value === 'string') {
      const allowed = getSelectValues(field as Parameters<typeof getSelectValues>[0]);
      if (allowed && !allowed.includes(value)) {
        issues.push({
          path: `props.${key}`,
          message: `Invalid option: ${value}`,
          code: 'INVALID_OPTION',
        });
      }
    }

    if (field.kind === 'text' || field.kind === 'url') {
      if (typeof value !== 'string') {
        issues.push({
          path: `props.${key}`,
          message: `${field.label ?? key} must be text`,
          code: 'INVALID_TYPE',
        });
        continue;
      }
      const pattern = field.pattern as string | undefined;
      if (pattern && !new RegExp(pattern).test(value)) {
        issues.push({
          path: `props.${key}`,
          message: `Value does not match pattern`,
          code: 'PATTERN',
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}
