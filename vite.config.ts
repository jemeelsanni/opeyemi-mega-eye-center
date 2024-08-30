import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Ensure path module is imported

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve `react-quill` directly to the module directory
      'react-quill': path.resolve(__dirname, 'node_modules/react-quill'),
    },
  },
  // Rollup options might not need to specify external for `react-quill` in most cases
  // build: {
  //   rollupOptions: {
  //     external: ['react-quill'], // Keep only if necessary
  //   },
  // },
});
