import { describe, expect, it } from 'vitest';
import { parseSourceFile, findJsxElementAt } from './parse.js';
import { patchDeleteElement, patchInsertElement, patchSetProp } from './patch.js';

const FIXTURE = `
export function Demo() {
  return (
    <Stack direction="vertical">
      <Button variant="primary">Click</Button>
    </Stack>
  );
}
`;

describe('parseSourceFile', () => {
  it('indexes JSX elements with stable ids', () => {
    const parsed = parseSourceFile('Demo.tsx', FIXTURE);
    expect(parsed.rootIds.length).toBeGreaterThan(0);
    const stack = [...parsed.elements.values()].find((e) => e.tagName === 'Stack');
    expect(stack).toBeDefined();
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button');
    expect(button?.parentId).toBe(stack?.id);
  });

  it('finds element at offset', () => {
    const parsed = parseSourceFile('Demo.tsx', FIXTURE);
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button')!;
    const found = findJsxElementAt(parsed, button.location.start + 2);
    expect(found?.tagName).toBe('Button');
  });
});

describe('patchSetProp', () => {
  it('updates a string prop on JSX element', () => {
    const parsed = parseSourceFile('Demo.tsx', FIXTURE);
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button')!;
    const result = patchSetProp(FIXTURE, {
      file: 'Demo.tsx',
      elementId: button.id,
      propName: 'variant',
      value: 'secondary',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).toContain('variant={"secondary"}');
    }
  });
});

describe('patchInsertElement', () => {
  it('inserts JSX inside parent', () => {
    const parsed = parseSourceFile('Demo.tsx', FIXTURE);
    const stack = [...parsed.elements.values()].find((e) => e.tagName === 'Stack')!;
    const result = patchInsertElement(FIXTURE, {
      file: 'Demo.tsx',
      parentElementId: stack.id,
      jsx: '<Heading>Hi</Heading>',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).toContain('<Heading>Hi</Heading>');
    }
  });
});

describe('patchDeleteElement', () => {
  it('removes element from source', () => {
    const parsed = parseSourceFile('Demo.tsx', FIXTURE);
    const button = [...parsed.elements.values()].find((e) => e.tagName === 'Button')!;
    const result = patchDeleteElement(FIXTURE, {
      file: 'Demo.tsx',
      elementId: button.id,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patches[0].content).not.toContain('<Button');
    }
  });
});
