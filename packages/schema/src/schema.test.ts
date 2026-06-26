import { describe, expect, it } from 'vitest';
import {
  text,
  number,
  boolean,
  select,
  defineComponent,
  createDefaultProps,
  validateProps,
  image,
  json,
} from '../src/index.js';

describe('field builders', () => {
  it.each([
    ['text', text({ label: 'Title', defaultValue: 'Hello' }), 'text', 'Title'],
    ['number', number({ label: 'Count', defaultValue: 1 }), 'number', 'Count'],
    ['boolean', boolean({ label: 'Active', defaultValue: false }), 'boolean', 'Active'],
  ] as const)('creates %s fields with label and kind', (_name, field, kind, label) => {
    expect(field.kind).toBe(kind);
    expect(field.label).toBe(label);
  });

  it('creates select fields with options', () => {
    const field = select({
      label: 'Variant',
      options: ['primary', { label: 'Secondary', value: 'secondary' }],
      defaultValue: 'primary',
    });
    expect(field.kind).toBe('select');
    expect(field.options).toHaveLength(2);
    expect(field.defaultValue).toBe('primary');
  });
});

describe('createDefaultProps', () => {
  it('generates defaults from schema', () => {
    const schema = {
      title: text({ defaultValue: 'Untitled' }),
      count: number({ defaultValue: 1 }),
      active: boolean({ defaultValue: false }),
    };
    expect(createDefaultProps(schema)).toEqual({
      title: 'Untitled',
      count: 1,
      active: false,
    });
  });

  it('skips fields without defaultValue', () => {
    const schema = {
      title: text({ label: 'Title' }),
      count: number({ defaultValue: 0 }),
    };
    expect(createDefaultProps(schema)).toEqual({ count: 0 });
  });
});

describe('validateProps', () => {
  const schema = {
    title: text({ required: true }),
    variant: select({ options: ['a', 'b'], required: true }),
    count: number({ min: 0, max: 10 }),
  };

  it('validates required fields', () => {
    const result = validateProps(schema, {});
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'REQUIRED')).toBe(true);
  });

  it('treats empty string as missing for required fields', () => {
    const result = validateProps({ title: text({ required: true }) }, { title: '' });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'REQUIRED')).toBe(true);
  });

  it('validates select options', () => {
    const result = validateProps(schema, { title: 'Hi', variant: 'c', count: 5 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_OPTION')).toBe(true);
  });

  it('rejects numbers below min', () => {
    const result = validateProps({ count: number({ min: 0, max: 10 }) }, { count: -1 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'MIN')).toBe(true);
  });

  it('rejects numbers above max', () => {
    const result = validateProps({ count: number({ min: 0, max: 10 }) }, { count: 11 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'MAX')).toBe(true);
  });

  it('accepts numbers at boundaries', () => {
    const countSchema = { count: number({ min: 0, max: 10 }) };
    expect(validateProps(countSchema, { count: 0 }).valid).toBe(true);
    expect(validateProps(countSchema, { count: 10 }).valid).toBe(true);
  });

  it('validates text pattern', () => {
    const result = validateProps({ slug: text({ pattern: '^[a-z]+$' }) }, { slug: 'Invalid-123' });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'PATTERN')).toBe(true);
  });

  it('passes valid props', () => {
    const result = validateProps(schema, { title: 'Hi', variant: 'a', count: 5 });
    expect(result.valid).toBe(true);
  });

  it('rejects NaN numbers', () => {
    const result = validateProps({ count: number({ min: 0, max: 10 }) }, { count: Number.NaN });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
  });

  it('rejects wrong-type number values', () => {
    const result = validateProps({ count: number({ min: 0, max: 10 }) }, { count: '5' });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
  });

  it('rejects wrong-type boolean values', () => {
    const result = validateProps({ active: boolean() }, { active: 'yes' });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
  });

  it('rejects non-string image values', () => {
    const result = validateProps({ src: image({ label: 'Image' }) }, { src: 42 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
  });

  it('rejects non-serializable json values', () => {
    const result = validateProps({ data: json({ label: 'Data' }) }, { data: () => {} });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_TYPE')).toBe(true);
  });

  it('accepts serializable json objects', () => {
    const result = validateProps({ data: json({ label: 'Data' }) }, { data: { ok: true } });
    expect(result.valid).toBe(true);
  });
});

describe('defineComponent', () => {
  it('merges schema defaults into defaultProps', () => {
    const def = defineComponent(() => null, {
      type: 'Button',
      props: {
        children: text({ defaultValue: 'Click me' }),
        disabled: boolean({ defaultValue: false }),
      },
    });
    expect(def.defaultProps).toEqual({ children: 'Click me', disabled: false });
  });

  it('lets explicit defaultProps override schema defaults', () => {
    const def = defineComponent(() => null, {
      type: 'Button',
      props: {
        children: text({ defaultValue: 'Click me' }),
      },
      defaultProps: { children: 'Override' },
    });
    expect(def.defaultProps).toEqual({ children: 'Override' });
  });
});
