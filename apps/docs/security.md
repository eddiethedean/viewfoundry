# Security

ViewFoundry is an **embeddable editor for trusted integrators** — not a multi-tenant CMS with untrusted author HTML. Treat documents, component definitions, and import maps as **trusted application data** unless you add your own sandboxing.

## Document JSON

- `ViewDocument` is JSON loaded from your app, API, or filesystem. Malformed JSON is rejected by `validateDocument`; semantic issues return structured `ValidationIssue` codes.
- Do not expose raw document editing to anonymous users without authentication and authorization in **your** app layer.
- The editor does not execute arbitrary scripts from document JSON — it renders registered React components only.

## Codegen output

`@viewfoundry/codegen` sanitizes export names, import paths, and prop keys before emitting TSX:

- JavaScript **reserved words** are rejected as export names (warnings, skipped imports).
- **Absolute import paths** (leading `/`) are rejected.
- Invalid identifiers and unsafe string content are omitted or escaped with warnings.

Review `warnings` from `generateTsx` before writing files in automated pipelines. Use `--strict` on `viewfoundry export` in CI when warnings should fail the build.

Generated TSX is React source — compile and review it like any other application code.

## CLI and Vite path containment

- **`viewfoundry export`** resolves output paths relative to the current working directory and rejects paths that escape the project root (`resolveSafeOutputPath`).
- **`@viewfoundry/vite`** resolves `document`, `codegen.output`, `codegen.imports`, and `codegen.tokens` within the Vite project root. Path traversal outside the root is rejected.

Do not point codegen output at sensitive system paths even when paths stay “relative” — keep outputs inside your app tree.

## Component registry

Only register React components you trust. The editor invokes registered components with props from the document; malicious prop values are constrained by schema validation but components must still follow normal React XSS hygiene (avoid `dangerouslySetInnerHTML` with author content unless sanitized).

## Style and tokens

`node.style` values are validated against allowed style field rules. Token references resolve through your `styleTokens` map — supply tokens from trusted configuration, not end-user uploads, unless you validate them.

## Dependencies

Install all `@viewfoundry/*` packages at the **same version** to avoid peer dependency skew. See [Troubleshooting — peer dependencies](troubleshooting.md#peer-dependency-warnings).

## Reporting issues

Report security concerns privately via [GitHub Security Advisories](https://github.com/eddiethedean/viewfoundry/security/advisories) or repository maintainers before public disclosure.

## Related

- [Production patterns](production-patterns.md)
- [Troubleshooting](troubleshooting.md)
- [Package API spec](package-api-spec.md)
