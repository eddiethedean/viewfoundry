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
    doc.root.children = [
      createNode('Button', { variant: 'primary', children: 'Click me' }, [], 'btn1'),
    ];

    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings).toHaveLength(0);
    expect(code).toContain("import { Button } from './components/Button';");
    expect(code).toContain('<Button variant=\'primary\'>{"Click me"}</Button>');
    expect(code).toContain('export function GeneratedView()');
  });

  it('generates nested TSX', () => {
    const doc = createDocument();
    const card = createNode(
      'Card',
      {},
      [createNode('Button', { children: 'Inner' }, [], 'btn')],
      'card',
    );
    doc.root.children = [card];

    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Card>');
    expect(code).toContain('<Button>{"Inner"}</Button>');
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
    expect(code).toContain('<Button disabled>{"X"}</Button>');
    expect(code).not.toContain('disabled={true}');
  });

  it('escapes special characters in string props', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { title: `O'Reilly\n"quoted"`, children: 'X' }, [], 'b1'),
    ];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Button title=\'O\\\'Reilly\\n"quoted"\'>{"X"}</Button>');
  });

  it('escapes angle brackets in string children via JSON expression', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: '<unsafe>' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Button>{"<unsafe>"}</Button>');
  });

  it('warns on unsupported function props', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { onClick: () => {}, children: 'X' }, [], 'b1')];
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

  it('rejects malicious component names', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'A' }, [], 'b1')];
    const { code, warnings } = generateTsx({
      document: doc,
      imports,
      componentName: 'Evil() {}\nexport function Real',
    });
    expect(warnings.some((w) => w.includes('Invalid component name'))).toBe(true);
    expect(code).toContain('export function GeneratedView()');
    expect(code).not.toContain('Evil()');
  });

  it('rejects unsafe import paths', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'A' }, [], 'b1')];
    const { code, warnings } = generateTsx({
      document: doc,
      imports: {
        Button: {
          importPath: "'; alert(1); //",
          exportName: 'Button',
        },
      },
    });
    expect(warnings.some((w) => w.includes('Invalid import path'))).toBe(true);
    expect(code).not.toContain('alert(1)');
  });

  it('skips invalid prop keys', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'A', 'onClick=alert(1)': true }, [], 'b1'),
    ];
    const { code, warnings } = generateTsx({ document: doc, imports });
    expect(warnings.some((w) => w.includes('invalid prop key'))).toBe(true);
    expect(code).not.toContain('onClick=alert');
  });

  it('sanitizes component type in missing-import comments', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Bad-->Type', {}, [], 'u1')];
    const { code } = generateTsx({ document: doc, imports: {} });
    expect(code).not.toContain('Bad-->Type');
    expect(code).toContain('Bad--&gt;Type');
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
    expect(code).toContain('<Button>{"A"}</Button>');
    expect(code).toContain('<Button>{"B"}</Button>');
  });

  it('does not wrap a single root child in a fragment', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Only' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).not.toMatch(/<>\s*\n\s*<Button>/);
    expect(code).toContain('<Button>{"Only"}</Button>');
  });

  it('renders self-closing tags when there are no children', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { variant: 'primary' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain("<Button variant='primary' />");
  });

  it('escapes curly braces in string children via expression', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', { children: 'Hello {name}' }, [], 'b1')];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('<Button>{"Hello {name}"}</Button>');
  });

  it('emits grid placement in a wrapper div', () => {
    const doc = createDocument();
    const grid = createNode('Grid', { columns: 4, rows: 2 }, [], 'grid1');
    const button = createNode('Button', { children: 'A' }, [], 'b1', {
      grid: { column: 2, row: 1, colSpan: 2 },
    });
    grid.children = [button];
    doc.root.children = [grid];
    const gridImports = {
      Grid: { importPath: './components', exportName: 'Grid' },
      Button: { importPath: './components', exportName: 'Button' },
    };
    const { code } = generateTsx({ document: doc, imports: gridImports });
    expect(code).toContain("gridColumn: '2 / 4'");
    expect(code).toContain("gridRow: '1'");
    expect(code).toMatch(/<div style=\{\{ gridColumn: '2 \/ 4', gridRow: '1' \}\}>/);
    expect(code).toContain('<Button>{"A"}</Button>');
  });

  it('emits node.style as inline style prop', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'Styled' }, [], 'b1', undefined, {
        margin: 8,
        backgroundColor: '#ff0000',
      }),
    ];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('style={{"margin":8,"backgroundColor":"#ff0000"}}');
  });

  it('merges props.style with node.style favoring node.style', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode(
        'Button',
        { children: 'Merged', style: { margin: 4, color: '#000' } },
        [],
        'b1',
        undefined,
        { margin: 8, padding: 16 },
      ),
    ];
    const { code } = generateTsx({ document: doc, imports });
    expect(code).toContain('"margin":8');
    expect(code).toContain('"padding":16');
    expect(code).toContain('"color":"#000"');
  });

  it('resolves style tokens when styleTokens provided', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'Token' }, [], 'b1', undefined, {
        color: 'color.primary',
      }),
    ];
    const { code } = generateTsx({
      document: doc,
      imports,
      styleTokens: { 'color.primary': '#336699' },
    });
    expect(code).toContain('"color":"#336699"');
  });

  it('emits grid wrapper and node.style on component', () => {
    const doc = createDocument();
    const grid = createNode('Grid', { columns: 2, rows: 2 }, [], 'grid1');
    const button = createNode(
      'Button',
      { children: 'Both' },
      [],
      'b1',
      { grid: { column: 1, row: 1 } },
      { margin: 4 },
    );
    grid.children = [button];
    doc.root.children = [grid];
    const gridImports = {
      Grid: { importPath: './components', exportName: 'Grid' },
      Button: { importPath: './components', exportName: 'Button' },
    };
    const { code } = generateTsx({ document: doc, imports: gridImports });
    expect(code).toContain("gridColumn: '1'");
    expect(code).toContain('style={{"margin":4}}');
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
