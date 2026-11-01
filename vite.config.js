import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Percorsi relativi: più compatibili con GitHub Pages in un repository di progetto.
  base: './'
});
