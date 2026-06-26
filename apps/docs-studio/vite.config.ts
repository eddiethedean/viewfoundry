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
    // Stable filenames avoid RTD/CDN hash mismatches between index.html and JS/CSS.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/studio.js',
        chunkFileNames: 'assets/studio-[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? '';
          if (name.endsWith('.css')) return 'assets/studio.css';
          return 'assets/studio-[name][extname]';
        },
      },
    },
  },
});
