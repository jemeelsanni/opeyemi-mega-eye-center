import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-quill': path.resolve(__dirname, 'node_modules/react-quill'),
      'react-quill/dist/quill.snow.css': path.resolve(__dirname, 'node_modules/react-quill/dist/quill.snow.css'),
    },
  },
  build: {
    rollupOptions: {
      external: ['react-quill', 'react-quill/dist/quill.snow.css'],
    },
  },
});
