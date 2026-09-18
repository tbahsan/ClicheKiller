import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || '/',
  server: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: process.env.DEV_ALLOW_ALL_HOSTS === 'true' ? true : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4175,
    allowedHosts: process.env.DEV_ALLOW_ALL_HOSTS === 'true' ? true : undefined,
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'ClicheKiller — Cliché Detector & Rewriter',
        short_name: 'ClicheKiller',
        description: 'Instant detector and 1-click alternative suggester for overused clichés, metaphors, and jargon.',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,json}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
});
