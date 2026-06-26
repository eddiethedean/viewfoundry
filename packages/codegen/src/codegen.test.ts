import { describe, expect, it } from 'vitest';
import { createDocument, createNode } from '@viewfoundry/core';
import { generateTsx, generateJson } from '../src/index.js';

const imports = {
  Button: { importPath: './components/Button', exportName: 'Button' },
  Card: { importPath: './components/Card', exportName: 'Card' },
  Icon: { importPath: './components/Icon', exportName: 'Icon', defaultImport: true },
};

describe('generateTsx', () => {
  it('generates simple TSX', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { variant: 'primary', children: 'Click me' }, [], 'btn1')];

    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings).toHaveLength(0);
    expect(code).toContain("import { Button } from './components/Button';");
    expect(code).toContain("<Button variant='primary'>Click me</Button>");
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

  it('renders boolean true props as shorthand attributes', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { disabled: true, children: 'X' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Button disabled>X</Button>');
    expect(code).not.toContain('disabled={true}');
  });

  it('escapes special characters in string props', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { title: `O'Reilly\n"quoted"`, children: 'X' }, [], 'b1'),
    ];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain("<Button title='O\\'Reilly\\n\"quoted\"'>X</Button>");
  });

  it('escapes angle brackets in string children', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: '<unsafe>' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Button>&lt;unsafe&gt;</Button>');
  });

  it('warns on unsupported function props', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { onClick: () => {}, children: 'X' }, [], 'b1'),
    ];
    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings.some((w) => w.includes('Unsupported function'))).toBe(true);
    expect(code).not.toContain('onClick');
  });

  it('uses default import syntax when configured', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Icon', {}, [], 'i1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain("import Icon from './components/Icon';");
  });

  it('uses custom component name', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'A' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports, componentName: 'MyView' });
    expect(code).toContain('export function MyView()');
  });

  it('wraps multiple root children in a fragment', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'A' }, [], 'b1'),
      createNode('Button', { children: 'B' }, [], 'b2'),
    ];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<>');
    expect(code).toContain('</>');
    expect(code).toContain('<Button>A</Button>');
    expect(code).toContain('<Button>B</Button>');
  });

  it('does not wrap a single root child in a fragment', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Only' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).not.toMatch(/<>\s*\n\s*<Button>/);
    expect(code).toContain('<Button>Only</Button>');
  });

  it('renders self-closing tags when there are no children', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { variant: 'primary' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain("<Button variant='primary' />");
  });
});

describe('generateJson', () => {
  it('round-trips a document', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hi' }, [], 'b1')];
    const json = generateJson(doc);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(doc);
  });
});
