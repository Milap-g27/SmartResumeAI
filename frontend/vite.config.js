import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze': 'http://localhost:8000',
      '/mock-interview': 'http://localhost:8000',
      '/session': 'http://localhost:8000',
      '/download': 'http://localhost:8000',
    },
  },
});
