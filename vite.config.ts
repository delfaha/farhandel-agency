import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Chemin de publication : « / » par défaut, « /farhandel-agency/ » pour GitHub Pages (variable BASE_PATH).
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Pré-bundle explicite : évite un rechargement forcé quand une dépendance n'est découverte qu'à la navigation.
  optimizeDeps: {
    include: ['react', 'react-dom/client', 'react-router', 'react-router/dom', 'framer-motion', 'lucide-react'],
  },
})
