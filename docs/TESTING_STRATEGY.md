# Testing Strategy

## Core package tests

Test:

- document creation
- node traversal
- insert node
- delete node
- duplicate node
- move node
- update props
- selection changes
- undo/redo
- validation
- registry behavior

## Schema package tests

Test:

- field builders
- default values
- select option validation
- required validation
- component definition typing where practical

## React runtime tests

Test:

- document renders component tree
- props are passed correctly
- children render recursively
- missing components render fallback
- provider exposes hooks

## Editor tests

Test:

- palette renders registered components
- clicking component inserts node
- selecting node shows inspector
- changing prop updates canvas
- undo/redo buttons work
- delete works

## Codegen tests

Test:

- TSX output for simple tree
- nested tree output
- string children handling
- imports
- missing import warnings
- unsupported prop value warnings

## CI commands

```bash
pnpm typecheck
pnpm test
pnpm build
```
