import { useState } from 'react';
import { createRegistry } from '@viewfoundry/core';
import { defineComponent, select, text } from '@viewfoundry/schema';

export function CounterButton() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Count {count}
    </button>
  );
}

function DemoButtonComponent({
  children,
  variant,
}: {
  children?: string;
  variant?: string;
}) {
  return (
    <button type="button" data-variant={variant}>
      {children}
    </button>
  );
}

function DemoCardComponent({ children }: { children?: React.ReactNode }) {
  return <div data-testid="demo-card">{children}</div>;
}

const demoButtonDef = defineComponent(DemoButtonComponent, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  acceptsChildren: true,
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({
      label: 'Variant',
      options: ['primary', 'secondary'],
      defaultValue: 'primary',
    }),
  },
});

const demoCardDef = defineComponent(DemoCardComponent, {
  type: 'Card',
  label: 'Card',
  category: 'Layout',
  acceptsChildren: true,
});

const counterButtonDef = defineComponent(CounterButton, {
  type: 'CounterButton',
  label: 'Counter',
  category: 'Controls',
});

export function createDemoRegistry() {
  return createRegistry([demoButtonDef, demoCardDef, counterButtonDef]);
}
