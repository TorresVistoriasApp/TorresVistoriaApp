import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
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
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/pdfmake")) return "pdfmake";
          if (id.includes("node_modules/exceljs")) return "exceljs";
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) return "charts";
          if (id.includes("node_modules/@supabase")) return "api";
          if (id.includes("node_modules/@tanstack/react-query")) return "query";
          if (id.includes("node_modules/browser-image-compression")) return "compress-image";
        },
      },
    },
  },
});
