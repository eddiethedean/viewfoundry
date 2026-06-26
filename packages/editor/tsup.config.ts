import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@viewfoundry/core',
    '@viewfoundry/react',
    '@viewfoundry/schema',
    'zustand',
  ],
});
