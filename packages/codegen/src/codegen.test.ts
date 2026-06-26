import { describe, expect, it } from 'vitest';
import { createDocument, createNode } from '@viewfoundry/core';
import { generateTsx } from '../src/index.js';

const imports = {
  Button: { importPath: './components/Button', exportName: 'Button' },
  Card: { importPath: './components/Card', exportName: 'Card' },
};

describe('generateTsx', () => {
  it('generates simple TSX', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { variant: 'primary', children: 'Click me' }, [], 'btn1')];

    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings).toHaveLength(0);
    expect(code).toContain("import { Button } from './components/Button';");
    expect(code).toContain('<Button variant=\'primary\'>Click me</Button>');
    expect(code).toContain('export function GeneratedView()');
  });

  it('generates nested TSX', () => {
    const doc = createDocument();
    const card = createNode('Card', {}, [createNode('Button', { children: 'Inner' }, [], 'btn')], 'card');
    doc.root.children = [card];

    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Card>');
    expect(code).toContain('<Button>Inner</Button>');
    expect(code).toContain('</Card>');
  });

  it('warns on missing imports', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown', {}, [], 'u1')];

    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings.some((w) => w.includes('Missing import'))).toBe(true);
    expect(code).toContain('Missing component: Unknown');
  });

  it('is deterministic', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'A' }, [], 'b1')];
    const a = generateTsx({ document: doc, imports });
    const b = generateTsx({ document: doc, imports });
    expect(a.code).toBe(b.code);
  });

  it('handles boolean props', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { disabled: true, children: 'X' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('disabled');
  });
});
