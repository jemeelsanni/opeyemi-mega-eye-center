import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-quill': 'react-quill',
    },
  },
  build: {
    rollupOptions: {
      external: ['react-quill'], // Only externalize the library, not the CSS
    },
  },
});
