# Try the Studio

This page embeds a working **ViewFoundryEditor** build served from the same documentation site. No separate dev server is required.

Use **Edit** mode to drag components from the palette, edit props in the **Component** inspector or **Style** sub-mode, and undo/redo. Switch to **Live** to interact with the rendered output in the same viewport.

<p>
  <a href="_static/studio/index.html" target="_blank" rel="noopener noreferrer">
    Open the Studio in a new tab
  </a>
  (recommended if the embed below is blank or fails to load).
</p>

<div class="studio-embed" id="viewfoundry-studio-embed-root">
  <div class="studio-embed-header">
    <button
      type="button"
      class="studio-fullscreen-btn"
      id="studio-fullscreen-toggle"
      aria-label="Enter full screen"
      aria-pressed="false"
    >
      Full screen
    </button>
  </div>
  <iframe
    id="viewfoundry-studio-embed"
    title="ViewFoundry Studio"
  ></iframe>
  <p class="studio-embed-caption">
    Embedded studio — uses the same demo components as <code>examples/basic-react</code>.
    Document state persists in your browser localStorage. Export TSX from the toolbar; use
    <strong>Show JSON</strong> below the editor for the raw document.
  </p>
</div>

<script>
  (function () {
    var root = document.getElementById('viewfoundry-studio-embed-root');
    var iframe = document.getElementById('viewfoundry-studio-embed');
    var toggle = document.getElementById('studio-fullscreen-toggle');
    if (!root || !iframe || !toggle) return;

    iframe.src = new URL('_static/studio/index.html', window.location.href).href;

    var fullscreenClass = 'studio-embed--fullscreen';

    function nativeFullscreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function isNativeFullscreen() {
      return nativeFullscreenElement() === root;
    }

    function isFullscreen() {
      return root.classList.contains(fullscreenClass) || isNativeFullscreen();
    }

    function updateToggle() {
      var on = isFullscreen();
      toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      toggle.setAttribute('aria-label', on ? 'Exit full screen' : 'Enter full screen');
      toggle.textContent = on ? 'Exit full screen' : 'Full screen';
      document.body.classList.toggle('studio-embed-fullscreen-active', on);
    }

    function enterFullscreen() {
      root.classList.add(fullscreenClass);
      updateToggle();
      var request = root.requestFullscreen || root.webkitRequestFullscreen;
      if (request) {
        Promise.resolve(request.call(root)).catch(function () {
          /* CSS overlay remains active */
        });
      }
    }

    function exitFullscreen() {
      root.classList.remove(fullscreenClass);
      if (isNativeFullscreen()) {
        var exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) exit.call(document);
      }
      updateToggle();
    }

    toggle.addEventListener('click', function () {
      if (isFullscreen()) exitFullscreen();
      else enterFullscreen();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isFullscreen()) {
        exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', function () {
      if (!isNativeFullscreen() && !root.classList.contains(fullscreenClass)) {
        document.body.classList.remove('studio-embed-fullscreen-active');
      }
      updateToggle();
    });
    document.addEventListener('webkitfullscreenchange', updateToggle);
  })();
</script>

## Build pipeline

The studio bundle is produced by `apps/docs-studio` (Vite) and copied to `apps/docs/_static/studio/` when you run:

```bash
pnpm docs:build
```

Read the Docs runs the same pipeline via `.readthedocs.yaml` before the Sphinx HTML build.
