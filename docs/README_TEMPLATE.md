# ViewFoundry

ViewFoundry is an embeddable visual editor framework for React applications.

Register your real components. **Embed mode (today):** JSON document, canvas editor, TSX export. **Code-first (v0.7+):** visual edits write to TSX/CSS — see [Roadmap & direction](https://viewfoundry.readthedocs.io/en/latest/roadmap-and-direction.html).

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
    disabled: boolean({ label: 'Disabled' }),
  },
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
