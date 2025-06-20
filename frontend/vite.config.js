import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/static/",          // Vite rewrites asset URLs
  build: {
    outDir: "../frontend-dist",   // folder at repo root after build
    emptyOutDir: true,
  },
  plugins: [react()],
})
