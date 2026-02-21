import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: [
      '@runanywhere/web',
      '@runanywhere/web-llamacpp',
      '@runanywhere/web-onnx',
    ],
  },
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
  server: {
    allowedHosts: true, 
    hmr: {
      clientPort: 443, 
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
  },
});
