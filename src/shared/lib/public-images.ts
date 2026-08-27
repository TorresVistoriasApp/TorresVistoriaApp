/** Caminhos de imagens estáticas servidas de `public/images/`. */
export const PUBLIC_IMAGES = {
  brand: {
    /** Lockup vetorial — nítido em qualquer tamanho/densidade de tela. */
    lockup: "/images/brand/logo-lockup.svg",
    /** Monograma vetorial já recortado no bounding box da marca. */
    mark: "/images/brand/logo-mark.svg",
    /** Raster para og:image, PDF e Excel. */
    trim: "/images/brand/official-trim.webp",
    full: "/images/brand/official-full.webp",
  },
  auth: {
    inspection: "/images/auth/inspection.webp",
  },
  vehicleBrands: (slug: string) => `/images/vehicle-brands/${slug}.webp` as const,
  consultations: {
    /** Hero full-bleed (Unsplash License) — landscape cinematográfico. */
    hero: "/images/consultations/hero-bg-1920.webp",
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
  laudo: {
    vehicleTopView: "/images/laudo/vehicle-top-view.webp",
    sections: {
      vehicle: "/images/laudo/sections/vehicle.webp",
      inspection: "/images/laudo/sections/inspection.webp",
      camera: "/images/laudo/sections/camera.webp",
      checklist: "/images/laudo/sections/checklist.webp",
      damage: "/images/laudo/sections/damage.webp",
      authenticity: "/images/laudo/sections/authenticity.webp",
      conclusion: "/images/laudo/sections/conclusion.webp",
      paint: "/images/laudo/sections/paint.webp",
      opinion: "/images/laudo/sections/opinion.webp",
      legal: "/images/laudo/sections/legal.webp",
      market: "/images/laudo/sections/market.webp",
      structure: "/images/laudo/sections/structure.webp",
    },
  },
} as const;
