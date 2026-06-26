import { describe, expect, it } from 'vitest';
import {
  text,
  number,
  boolean,
  select,
  defineComponent,
  createDefaultProps,
  validateProps,
} from '../src/index.js';

describe('field builders', () => {
  it('creates stable schema objects', () => {
    const field = text({ label: 'Title', defaultValue: 'Hello' });
    expect(field.kind).toBe('text');
    expect(field.label).toBe('Title');
    expect(field.defaultValue).toBe('Hello');
  });

  it('creates select fields with options', () => {
    const field = select({
      label: 'Variant',
      options: ['primary', { label: 'Secondary', value: 'secondary' }],
      defaultValue: 'primary',
    });
    expect(field.kind).toBe('select');
    expect(field.options).toHaveLength(2);
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

  it('validates select options', () => {
    const result = validateProps(schema, { title: 'Hi', variant: 'c', count: 5 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_OPTION')).toBe(true);
  });

  it('passes valid props', () => {
    const result = validateProps(schema, { title: 'Hi', variant: 'a', count: 5 });
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
});
