# Try the Studio

This page embeds a working **ViewFoundryEditor** build served from the same documentation site. No separate dev server is required.

Use **Edit** mode to drag components from the palette, edit props in the inspector, and undo/redo. Switch to **Live** to interact with the rendered output in the same viewport.

<div class="studio-embed">
  <iframe
    title="ViewFoundry Studio"
    src="_static/studio/index.html"
    loading="lazy"
  ></iframe>
  <p class="studio-embed-caption">
    Embedded studio — uses the same demo components as <code>examples/basic-react</code>.
    Document state persists in your browser localStorage. Export TSX from the toolbar; use
    <strong>Show JSON</strong> below the editor for the raw document.
  </p>
</div>

## Build pipeline

The studio bundle is produced by `apps/docs-studio` (Vite) and copied to `apps/docs/_static/studio/` when you run:

```bash
pnpm docs:build
```

Read the Docs runs the same pipeline via `.readthedocs.yaml` before the Sphinx HTML build.
