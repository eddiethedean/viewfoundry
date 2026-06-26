import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viewfoundry } from '@viewfoundry/vite';

export default defineConfig({
  plugins: [
    react(),
    viewfoundry({
      codegen: {
        output: 'GeneratedView.tsx',
        imports: 'viewfoundry/imports.json',
        tokens: 'viewfoundry/tokens.json',
      },
    }),
  ],
  server: { port: 5173 },
});
