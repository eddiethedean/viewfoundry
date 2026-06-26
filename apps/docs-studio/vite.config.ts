import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@demo': path.resolve(__dirname, '../../examples/basic-react/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
