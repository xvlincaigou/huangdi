import { defineConfig } from 'vite';

export default defineConfig({
  base: '/huangdi/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
});
