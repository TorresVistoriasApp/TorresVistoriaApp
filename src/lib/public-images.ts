/** Caminhos de imagens estáticas servidas de `public/images/`. */
export const PUBLIC_IMAGES = {
  brand: {
    trim: "/images/brand/official-trim.webp",
    full: "/images/brand/official-full.webp",
    mark: "/images/brand/logo-curta-sidebar.webp",
  },
  auth: {
    loginBanner: "/images/auth/inspection-1.webp",
    loginShowcase: [
      "/images/auth/inspection-1.webp",
      "/images/auth/inspection-2.webp",
      "/images/auth/inspection-3.webp",
      "/images/auth/inspection-4.webp",
    ] as const,
  },
  vehicleBrands: (slug: string) => `/images/vehicle-brands/${slug}.webp` as const,
  placeholders: {
    logo: "/images/placeholders/logo.svg",
  },
} as const;
