/**
 * Tokens de cor alinhados ao tema atual (CSS variables em globals.css).
 *
 * Módulos novos devem preferir estes nomes a hex literais.
 */
export const colorTokens = {
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  background: "var(--background)",
  foreground: "var(--foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  border: "var(--border)",
  card: "var(--card)",
  destructive: "var(--destructive)",
  ring: "var(--ring)",
} as const;

export type ColorToken = keyof typeof colorTokens;
