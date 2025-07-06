import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [
    react(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      '@': path.resolve(__dirname, 'src'),
    },
  },
});