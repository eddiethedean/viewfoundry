# Responsive layout & design tokens

## Purpose

**Responsive** overrides for layout and style per breakpoint. **Design tokens** connect the Style Editor to host themes (brand colors, spacing scale).

**Planned: v0.15.0** (pre-1.0)

Extends **v0.4 Style Editor** and **v0.3 grid**.

## Responsive model

```ts
export type BreakpointId = 'sm' | 'md' | 'lg' | 'xl' | string;

export type Responsive<T> = {
  base?: T;
  byBreakpoint?: Partial<Record<BreakpointId, T>>;
};

// ViewNode.layout / ViewNode.style may become Responsive<NodeLayout | StyleTokenMap>
// Or parallel fields: layoutResponsive?, styleResponsive?
```

- Host registers breakpoint widths on `ViewFoundryProvider`.
- Editor toolbar: breakpoint switcher (edit overrides for current breakpoint).
- Canvas preview width slider optional.

## Design tokens

```ts
export type TokenReference = string; // 'color.primary', 'spacing.md'

export type StyleTokenMap = Record<string, string | number | TokenReference>;
```

- Host registers token dictionaries (`ThemeProvider` integration).
- Style inspector picks tokens from dropdown or raw value.
- Codegen resolves tokens to CSS variables or theme object paths.

## Acceptance

- User sets 4-column grid on `lg`, 1-column on `sm`.
- Token-backed `backgroundColor` survives theme switch in Live mode.

## See also

- [ROADMAP.md](ROADMAP.md) — v0.15.0
- [EDITOR_SPEC.md](EDITOR_SPEC.md) — Style Editor sub-mode
- [UX_AND_DX.md](UX_AND_DX.md) — breakpoint switcher and token labels
