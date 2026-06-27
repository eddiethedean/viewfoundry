import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viewfoundry, viewfoundryCodeFirst, viewfoundryLocInjection } from '@viewfoundry/vite';

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
    viewfoundryCodeFirst({ boards: 'src/**/*.board.tsx' }),
    viewfoundryLocInjection(),
  ],
  server: { port: 5173 },
});
