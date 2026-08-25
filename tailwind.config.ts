import type { Config } from "tailwindcss";

/**
 * Tailwind v4 — config complementar, consumido apenas pelo CLI do shadcn/ui
 * (referenciado em components.json). A fonte de verdade dos tokens em runtime
 * é o bloco @theme de src/styles/globals.css; os valores abaixo apenas o espelham.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#e2570c",
        background: "#f7f8f9",
        foreground: "#10151c",
        muted: "#f1f3f5",
        border: "#e4e7eb",
        destructive: "#dc2626",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.375rem",
      },
    },
  },
} satisfies Config;
