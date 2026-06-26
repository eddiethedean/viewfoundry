import type { Plugin } from 'vite';

export type ViewFoundryViteOptions = {
  /** Reserved for future HMR and config loading */
  enabled?: boolean;
};

/** Minimal Vite plugin stub for 0.1.0 — full integration planned for a later release. */
export function viewfoundry(_options: ViewFoundryViteOptions = {}): Plugin {
  return {
    name: 'viewfoundry',
  };
}
