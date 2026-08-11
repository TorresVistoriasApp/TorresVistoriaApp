/** Caminhos de imagens estáticas servidas de `public/images/`. */
export const PUBLIC_IMAGES = {
  brand: {
    trim: "/images/brand/official-trim.webp",
    full: "/images/brand/official-full.webp",
    mark: "/images/brand/logo-curta-sidebar.webp",
  },
  auth: {
    inspection: "/images/auth/inspection.webp",
  },
  vehicleBrands: (slug: string) => `/images/vehicle-brands/${slug}.webp` as const,
  consultations: {
    hero: "/images/consultations/heroconsultations.webp",
    sampleReport: {
      front: "/images/consultations/sample-report/front.webp",
      rear: "/images/consultations/sample-report/rear.webp",
      side: "/images/consultations/sample-report/side.webp",
      interior: "/images/consultations/sample-report/interior.webp",
    },
  },
  placeholders: {
    logo: "/images/placeholders/logo.svg",
  },
} as const;
