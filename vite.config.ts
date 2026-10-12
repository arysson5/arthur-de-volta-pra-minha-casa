import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone-192.png', 'icone-512.png'],
      manifest: {
        name: 'Arthur de volta pra minha casa',
        short_name: 'Arthur',
        description: 'Presente de Dia das Crianças. Do Maranhão até São Paulo.',
        lang: 'pt-BR',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#0e1520',
        theme_color: '#1a2744',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest}'],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { host: true, port: 5173 },
});
