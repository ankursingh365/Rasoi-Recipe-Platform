import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // While you develop, the React app runs on port 5173 and the API on port 4000.
    // The proxy forwards every request that starts with /api to the API, so the browser
    // only ever talks to one address. That keeps login cookies simple and needs no CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});