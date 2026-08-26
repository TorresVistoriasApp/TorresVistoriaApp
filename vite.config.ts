import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/** Chunks pesados: só baixam sob demanda; não entram no precache do SW. */
const HEAVY_CHUNK_IGNORE = [
  "**/pdfmake-*.js",
  "**/pdf-lib-*.js",
  "**/exceljs-*.js",
  "**/heic2any-*.js",
  "**/charts-*.js",
];

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: [
        "images/favicon/favicon.ico",
        "images/favicon/favicon-16x16.png",
        "images/favicon/favicon-32x32.png",
        "images/favicon/apple-touch-icon.png",
        "images/favicon/android-chrome-192x192.png",
        "images/favicon/android-chrome-512x512.png",
        "images/favicon/site.webmanifest",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        // Shell + rotas comuns cabem abaixo disso; libs de PDF/Excel ficam de fora.
        maximumFileSizeToCacheInBytes: 800 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        globIgnores: ["**/node_modules/**", ...HEAVY_CHUNK_IGNORE],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.includes("/storage/v1/object/sign/") ||
              url.pathname.includes("/storage/v1/object/public/"),
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/images/consultations/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "consultation-images",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      manifest: {
        name: "Torres Vistoria",
        short_name: "Torres",
        description: "Sistema de vistoria cautelar veicular",
        theme_color: "#ea580c",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/images/favicon/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/favicon/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Landing/marketing não precisa pré-carregar charts/compress no first paint.
        return deps.filter(
          (dep) => !dep.includes("charts-") && !dep.includes("compress-image-"),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/pdfmake")) return "pdfmake";
          if (id.includes("node_modules/pdf-lib")) return "pdf-lib";
          if (id.includes("node_modules/exceljs")) return "exceljs";
          if (id.includes("node_modules/heic2any")) return "heic2any";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) return "charts";
          if (id.includes("node_modules/@supabase")) return "api";
          if (id.includes("node_modules/@tanstack/react-query")) return "query";
          if (id.includes("node_modules/browser-image-compression")) return "compress-image";
        },
      },
    },
  },
});
