import { createRegistry } from '@viewfoundry/core';
import { defineComponent, text, select, boolean, number } from '@viewfoundry/schema';
import { Button, Card, Stack, Grid, Row, Heading, Text } from './components/index.js';

const layoutChildren = ['Button', 'Card', 'Stack', 'Grid', 'Row', 'Heading', 'Text'];

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({
      label: 'Variant',
      options: ['primary', 'secondary', 'ghost'],
      defaultValue: 'primary',
    }),
    disabled: boolean({ label: 'Disabled', defaultValue: false }),
  },
});

export const CardDefinition = defineComponent(Card, {
  type: 'Card',
  label: 'Card',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: layoutChildren,
  props: {
    title: text({ label: 'Title', defaultValue: 'Card title' }),
  },
});

export const StackDefinition = defineComponent(Stack, {
  type: 'Stack',
  label: 'Stack',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: layoutChildren,
  props: {
    direction: select({
      label: 'Direction',
      options: ['vertical', 'horizontal'],
      defaultValue: 'vertical',
    }),
    gap: number({ label: 'Gap', defaultValue: 12, min: 0, max: 64 }),
  },
});

export const GridDefinition = defineComponent(Grid, {
  type: 'Grid',
  label: 'Grid',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: layoutChildren,
  props: {
    columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
    rows: number({ label: 'Rows', defaultValue: 2, min: 1, max: 12 }),
    gap: number({ label: 'Gap', defaultValue: 8, min: 0, max: 64 }),
    minRowHeight: number({ label: 'Min row height', defaultValue: 48, min: 0, max: 200 }),
  },
});

export const RowDefinition = defineComponent(Row, {
  type: 'Row',
  label: 'Row',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: layoutChildren,
  props: {
    columns: number({ label: 'Columns', defaultValue: 4, min: 1, max: 12 }),
    gap: number({ label: 'Gap', defaultValue: 8, min: 0, max: 64 }),
  },
});

export const HeadingDefinition = defineComponent(Heading, {
  type: 'Heading',
  label: 'Heading',
  category: 'Typography',
  props: {
    children: text({ label: 'Text', defaultValue: 'Heading' }),
    level: select({
      label: 'Level',
      options: ['h1', 'h2', 'h3'],
      defaultValue: 'h2',
    }),
  },
});

export const TextDefinition = defineComponent(Text, {
  type: 'Text',
  label: 'Text',
  category: 'Typography',
  props: {
    children: text({ label: 'Text', defaultValue: 'Body text' }),
    size: select({
      label: 'Size',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
    }),
  },
});

export const styleTokens = {
  'color.primary': '#3182ce',
  'color.secondary': '#718096',
  'spacing.md': 16,
};

export const demoRegistry = createRegistry([
  ButtonDefinition,
  CardDefinition,
  StackDefinition,
  GridDefinition,
  RowDefinition,
  HeadingDefinition,
  TextDefinition,
]);

export const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Card: { importPath: './components', exportName: 'Card' },
  Stack: { importPath: './components', exportName: 'Stack' },
  Grid: { importPath: './components', exportName: 'Grid' },
  Row: { importPath: './components', exportName: 'Row' },
  Heading: { importPath: './components', exportName: 'Heading' },
  Text: { importPath: './components', exportName: 'Text' },
};
