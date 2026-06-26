# Forms

## Purpose

Conventions and editor affordances for **form UIs** built from registered inputs — field bindings, validation metadata, submit triggers.

**Planned: v0.14.0** (pre-1.0)

Builds on **v0.8 interactions** and **v0.11 variables/bindings**.

## Schema conventions

- Input components expose standard events (`change`, `blur`) and value props.
- Optional `validation` metadata on prop fields (`required`, `pattern`, `min`, `max`).
- Form container component type (or `role: 'form'` registry flag) groups fields.

## Document model

- Form field values stored in **variables** (e.g. `variables.form.email`).
- Bindings connect inputs ↔ variables.
- `submit` trigger on form container runs interaction chain (validate → navigate / setProp / API action stub).

## Editor

- “Form mode” hints in inspector when selection is under a form container.
- Validation rule editor per bound field.
- Live mode: basic client-side validation before submit actions run.

## Codegen

- Emit controlled components wired to state object or `useViewVariables()`.

## See also

- [INTERACTIONS.md](INTERACTIONS.md)
- [DATA_BINDING.md](DATA_BINDING.md)
- [ROADMAP.md](ROADMAP.md) — v0.14.0
- [UX_AND_DX.md](UX_AND_DX.md) — form validation and submit feedback
