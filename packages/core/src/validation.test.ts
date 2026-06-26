import { describe, expect, it } from 'vitest';
import { createDocument, createNode, createRegistry, validateDocument } from '../src/index.js';

const buttonDef = {
  type: 'Button',
  label: 'Button',
  component: () => null,
  acceptsChildren: true,
};

describe('validateDocument', () => {
  it('detects duplicate node ids', () => {
    const doc = createDocument();
    const child = createNode('Button', {}, [], 'dup');
    doc.root.children = [child, { ...child }];
    const result = validateDocument(doc);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'DUPLICATE_NODE_ID')).toBe(true);
  });

  it('detects missing component types', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown')];
    const registry = createRegistry([buttonDef]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'UNKNOWN_COMPONENT_TYPE')).toBe(true);
  });

  it('detects invalid document version', () => {
    const doc = createDocument({ version: '99.0' as '0.1' });
    const result = validateDocument(doc);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_VERSION')).toBe(true);
  });

  it('detects missing root', () => {
    const doc = createDocument();
    // @ts-expect-error testing invalid document
    doc.root = undefined;
    const result = validateDocument(doc);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'MISSING_ROOT')).toBe(true);
  });

  it('detects invalid child types', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Card', {}, [createNode('Text', {}, [], 't1')], 'card1')];
    const registry = createRegistry([
      {
        type: 'Card',
        component: () => null,
        acceptsChildren: true,
        allowedChildren: ['Button'],
      },
      buttonDef,
    ]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_CHILD_TYPE')).toBe(true);
  });

  it('allows missing components when configured', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Unknown')];
    const registry = createRegistry([buttonDef]);
    const result = validateDocument(doc, registry, { allowMissingComponents: true });
    expect(result.valid).toBe(true);
    expect(result.issues.some((i) => i.code === 'UNKNOWN_COMPONENT_TYPE')).toBe(false);
  });

  it('does not require Root to be registered', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', {}, [], 'b1')];
    const registry = createRegistry([buttonDef]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(true);
  });

  it('detects children under parents that reject children', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Button', {}, [createNode('Text', {}, [], 't1')], 'btn1')];
    const registry = createRegistry([
      {
        type: 'Button',
        component: () => null,
        acceptsChildren: false,
      },
      { type: 'Text', component: () => null },
    ]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'PARENT_REJECTS_CHILDREN')).toBe(true);
  });

  it('detects children under parents without acceptsChildren', () => {
    const doc = createDocument();
    doc.root.children = [createNode('Heading', {}, [createNode('Text', {}, [], 't1')], 'h1')];
    const registry = createRegistry([
      { type: 'Heading', component: () => null },
      { type: 'Text', component: () => null },
    ]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'PARENT_REJECTS_CHILDREN')).toBe(true);
  });

  it('rejects invalid node.style values', () => {
    const doc = createDocument();
    doc.root.children = [
      createNode('Button', { children: 'Hi' }, [], 'btn1', undefined, { opacity: 2 }),
    ];
    const registry = createRegistry([buttonDef]);
    const result = validateDocument(doc, registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_STYLE_VALUE')).toBe(true);
  });
});
