# ViewFoundry

ViewFoundry is an embeddable visual editor framework for React applications.

Register your real components. ViewFoundry gives you a no-code editor, canvas, property inspector, document model, serialization, history, and code generation.

## Install

```bash
pnpm add @viewfoundry/core @viewfoundry/schema @viewfoundry/react @viewfoundry/editor
```

## Register components

```tsx
import { defineComponent, text, select, boolean } from '@viewfoundry/schema';
import { Button } from './Button';

export const ButtonDefinition = defineComponent(Button, {
  type: 'Button',
  label: 'Button',
  category: 'Controls',
  props: {
    children: text({ label: 'Text', defaultValue: 'Click me' }),
    variant: select({ label: 'Variant', options: ['primary', 'secondary'] }),
    disabled: boolean({ label: 'Disabled' })
  }
});
```

## Use the editor

```tsx
import { ViewFoundryEditor } from '@viewfoundry/editor';

export function Studio() {
  return (
    <ViewFoundryEditor
      components={[ButtonDefinition]}
      initialDocument={document}
      onChange={setDocument}
    />
  );
}
```

## Render without the editor

```tsx
import { ViewRenderer } from '@viewfoundry/react';

export function Page() {
  return <ViewRenderer document={document} components={components} />;
}
```

## License

TBD.
