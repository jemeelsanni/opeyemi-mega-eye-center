// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Add both the module and the CSS file as externals
      external: ['react-quill', 'react-quill/dist/quill.snow.css'],
    },
  },
});
