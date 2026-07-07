import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: ganti "base" di bawah dengan nama repo GitHub Pages kamu,
// misal: base: '/congklak-game/'
export default defineConfig({
  plugins: [react()],
  base: './',
});
