import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../public/js',
    emptyOutDir: true,
    rollupOptions: {
      input: './src/main.ts',
      output: {
        entryFileNames: 'bundle.js',
        format: 'iife', // important for browser usage in HBS
      },
    },
  },
});
