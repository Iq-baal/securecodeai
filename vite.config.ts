import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config - keep it simple, stupid
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0', // So I can test on my phone
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'), // @ alias because typing ../../../ is annoying
    }
  },
  // Vercel handles env vars automatically, no need to manually inject them
});
