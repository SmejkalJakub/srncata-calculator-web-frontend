import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  VitePWA({
    // keeps users up-to-date without you building a custom “Update available” UI
    registerType: "autoUpdate",

    // put these files into /public
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "pwa-192.png", "pwa-512.png", "maskable-512.png"],

    manifest: {
      name: "Konvertor souřadnic - Srncata Brnensko",
      short_name: "Souřadnice",
      description: "Převod souřadnic + odkazy na mapové služby.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      theme_color: "#16a34a",
      background_color: "#0b1220",
      icons: [
        { src: "pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
      ],
      screenshots: [
        {
          src: "/screenshots/desktop-wide.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide",
          label: "Konvertor souřadnic – desktop"
        },
        {
          src: "/screenshots/mobile-narrow.png",
          sizes: "750x1334",
          type: "image/png",
          form_factor: "narrow",
          label: "Konvertor souřadnic – mobil"
        }
      ]
    },

    // important for SPA + your /api proxy: don’t let navigation fallback eat /api/*
    workbox: {
      navigateFallback: "/index.html",
      navigateFallbackDenylist: [/^\/api\//],

      // don’t cache API responses by default (safe choice for your backend)
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
          handler: "NetworkOnly",
          options: { cacheName: "api" }
        }
      ]
    },

    // lets you test the PWA behavior during dev if you want (optional)
    devOptions: {
      enabled: true
    }
  })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/map": {
        target: "https://srncatabrnensko.cz",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/map/, "/map"),
      },
    },
  },
})
