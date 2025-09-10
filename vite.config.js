//No tocar este archivo
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // importante para rutas relativas en Amplify

  // 🔧 Evitar que Vite/ESBuild inserte top-level await en el bundle
  build: {
    target: 'es2020',
    modulePreload: {
      polyfill: false, // no generar preloads que requieran TLA
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis', // 👈 esto soluciona tu error de "global"
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});
