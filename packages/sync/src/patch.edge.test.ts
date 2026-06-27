import { describe, expect, it } from 'vitest';
import {
  parseSourceFile,
  extractJsxProps,
  validateSourceContent,
  applyPatchesToContent,
} from './index.js';
import { patchInsertElement, patchSetProp } from './patch.js';

describe('patchSetProp AST edge cases', () => {
  it('updates prop when comparison expression contains > in attribute', () => {
    const content = `
export function Demo() {
  return <Box count={n > 1 ? 2 : 1} label="hi" />;
}
`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const box = [...parsed.elements.values()].find((e) => e.tagName === 'Box')!;
    const result = patchSetProp(content, {
      file: 'Demo.tsx',
      elementId: box.id,
      propName: 'label',
      value: 'updated',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).toContain('label={"updated"}');
      expect(result.patches[0].content).toContain('n > 1');
    }
  });

  it('updates nested object style prop', () => {
    const content = `
export function Demo() {
  return <Box style={{ color: 'red', padding: 8 }} />;
}
`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const box = [...parsed.elements.values()].find((e) => e.tagName === 'Box')!;
    const result = patchSetProp(content, {
      file: 'Demo.tsx',
      elementId: box.id,
      propName: 'style',
      value: { color: 'blue' },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).toContain('style={{"color":"blue"}}');
    }
  });

  it('replaces shorthand boolean attribute', () => {
    const content = `export function Demo() { return <Button disabled />; }`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button')!;
    const props = extractJsxProps(content, button);
    expect(props.disabled).toBe(true);

    const result = patchSetProp(content, {
      file: 'Demo.tsx',
      elementId: button.id,
      propName: 'disabled',
      value: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).toContain('disabled={false}');
    }
  });
});

describe('patchInsertElement validation', () => {
  it('rejects negative insert index', () => {
    const content = `export function Demo() { return <Stack><Button /></Stack>; }`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const stack = [...parsed.elements.values()].find((e) => e.tagName === 'Stack')!;
    const result = patchInsertElement(content, {
      file: 'Demo.tsx',
      parentElementId: stack.id,
      index: -1,
      jsx: '<Heading />',
    });
    expect(result.ok).toBe(false);
  });
});

describe('validateSourceContent', () => {
  it('rejects TSX with parse diagnostics', () => {
    const result = validateSourceContent('Bad.tsx', 'export function X() { return <div ; }');
    expect(result.valid).toBe(false);
  });
});

describe('applyPatchesToContent', () => {
  it('applies multiple patches to same file sequentially', () => {
    const files = { 'A.tsx': '<Stack />' };
    const patches = [
      { file: 'A.tsx', content: '<Stack a />' },
      { file: 'A.tsx', content: '<Stack a b />' },
    ];
    const next = applyPatchesToContent(files, patches);
    expect(next['A.tsx']).toBe('<Stack a b />');
  });
});

describe('parseSourceFile fragments and expressions', () => {
  it('indexes JSX inside fragments', () => {
    const content = `export function Demo() { return (<><Button /></>); }`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button');
    expect(button).toBeDefined();
    expect(button?.parentId).toBeDefined();
  });

  it('indexes conditional JSX children', () => {
    const content = `
export function Demo() {
  return (
    <Stack>
      {show && <Button />}
    </Stack>
  );
}
`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const stack = [...parsed.elements.values()].find((e) => e.tagName === 'Stack')!;
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button')!;
    expect(button.parentId).toBe(stack.id);
  });

  it('preserves qualified tag names', () => {
    const content = `export function Demo() { return <motion.div />; }`;
    const parsed = parseSourceFile('Demo.tsx', content);
    const el = [...parsed.elements.values()].find((e) => e.tagName === 'motion.div');
    expect(el).toBeDefined();
  });
});
