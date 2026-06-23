import type { Config } from "tailwindcss";

/** Tailwind v4 — config complementar para shadcn/ui e referência de tokens */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#1e40af",
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#f1f5f9",
        border: "#e2e8f0",
        destructive: "#dc2626",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
} satisfies Config;
