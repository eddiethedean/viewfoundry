import { describe, expect, it } from 'vitest';
import { resolveStyleValue, validateStyle } from './style.js';

describe('validateStyle', () => {
  it('accepts valid style properties', () => {
    const result = validateStyle({
      margin: 8,
      padding: '16px',
      color: '#ff0000',
      backgroundColor: 'rgb(0, 0, 0)',
      opacity: 0.5,
      display: 'flex',
      flexDirection: 'row',
      textAlign: 'center',
      overflow: 'hidden',
    });
    expect(result.valid).toBe(true);
  });

  it('accepts token references', () => {
    const result = validateStyle({ color: 'color.primary', padding: 'spacing.md' });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid opacity', () => {
    const result = validateStyle({ opacity: 2 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_STYLE_VALUE')).toBe(true);
  });

  it('rejects invalid color', () => {
    const result = validateStyle({ color: 'not-a-color!!!' });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid display value', () => {
    const result = validateStyle({ display: 'invalid' });
    expect(result.valid).toBe(false);
  });

  it('rejects non-finite numbers', () => {
    const result = validateStyle({ margin: NaN });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid style keys', () => {
    const result = validateStyle({ 'bad-key': 1 });
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_STYLE_KEY')).toBe(true);
  });

  it('accepts fontWeight keywords and numeric values', () => {
    expect(validateStyle({ fontWeight: 'bold' }).valid).toBe(true);
    expect(validateStyle({ fontWeight: 'normal' }).valid).toBe(true);
    expect(validateStyle({ fontWeight: 600 }).valid).toBe(true);
  });

  it('accepts lineHeight normal and unitless numbers', () => {
    expect(validateStyle({ lineHeight: 'normal' }).valid).toBe(true);
    expect(validateStyle({ lineHeight: 1.5 }).valid).toBe(true);
  });

  it('accepts border shorthand strings', () => {
    expect(validateStyle({ border: '1px solid #000' }).valid).toBe(true);
  });

  it('allows custom camelCase style keys with loose validation', () => {
    expect(validateStyle({ customProp: 'value' }).valid).toBe(true);
    expect(validateStyle({ customProp: '' }).valid).toBe(false);
  });
});

describe('resolveStyleValue', () => {
  it('resolves token references via map', () => {
    expect(resolveStyleValue('color.primary', { 'color.primary': '#336699' })).toBe('#336699');
  });

  it('returns literal values unchanged', () => {
    expect(resolveStyleValue('#fff')).toBe('#fff');
    expect(resolveStyleValue(12)).toBe(12);
  });
});
