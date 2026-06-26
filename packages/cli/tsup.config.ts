import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts', 'src/cli.ts', 'src/init.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@viewfoundry/core', '@viewfoundry/codegen'],
});
