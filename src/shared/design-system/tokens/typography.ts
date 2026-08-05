/** Tipografia de referência (classes utilitárias / tamanhos). */
export const typographyTokens = {
  fontSans: "var(--font-sans)",
  sizeXs: "0.75rem",
  sizeSm: "0.875rem",
  sizeBase: "1rem",
  sizeLg: "1.125rem",
  sizeXl: "1.25rem",
  size2xl: "1.5rem",
  weightNormal: "400",
  weightMedium: "500",
  weightSemibold: "600",
  weightBold: "700",
} as const;

export type TypographyToken = keyof typeof typographyTokens;
