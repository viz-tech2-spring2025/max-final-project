import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/max-final-project",
  plugins: [react()],
  optimizeDeps: {
    include: ['@deck.gl/mapbox']
  }
});