import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: "/static/",
  build: {
    outDir: "../frontend-dist",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'nutri',
        short_name: 'nutri',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/apple_touch_icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      includeAssets: [
        'apple_touch_icon.png'
      ]
    })
  ]
})