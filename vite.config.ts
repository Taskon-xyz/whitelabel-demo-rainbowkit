import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the white-label demo SPA.
export default defineConfig({
  plugins: [react()],
  server: {
    // Always run the dev server on 5173 to match the embed's expected origin.
    port: 5175,
    strictPort: true,
  },
});
