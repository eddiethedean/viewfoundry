import { createRegistry } from '@viewfoundry/core';
import { defineComponent, text, select, boolean, number } from '@viewfoundry/schema';
import { Button, Card, Stack, Heading, Text } from './components/index.js';

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
  allowedChildren: ['Button', 'Stack', 'Heading', 'Text', 'Card'],
  props: {
    title: text({ label: 'Title', defaultValue: 'Card title' }),
  },
});

export const StackDefinition = defineComponent(Stack, {
  type: 'Stack',
  label: 'Stack',
  category: 'Layout',
  acceptsChildren: true,
  allowedChildren: ['Button', 'Card', 'Heading', 'Text', 'Stack'],
  props: {
    direction: select({
      label: 'Direction',
      options: ['vertical', 'horizontal'],
      defaultValue: 'vertical',
    }),
    gap: number({ label: 'Gap', defaultValue: 12, min: 0, max: 64 }),
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

export const demoRegistry = createRegistry([
  ButtonDefinition,
  CardDefinition,
  StackDefinition,
  HeadingDefinition,
  TextDefinition,
]);

export const importMap = {
  Button: { importPath: './components', exportName: 'Button' },
  Card: { importPath: './components', exportName: 'Card' },
  Stack: { importPath: './components', exportName: 'Stack' },
  Heading: { importPath: './components', exportName: 'Heading' },
  Text: { importPath: './components', exportName: 'Text' },
};
