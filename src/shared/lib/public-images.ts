/** Caminhos de imagens estáticas servidas de `public/images/`. */
export const PUBLIC_IMAGES = {
  brand: {
    /** Lockup vetorial — nítido em qualquer tamanho/densidade de tela. */
    lockup: "/images/brand/logo-lockup.svg",
    /** Monograma vetorial já recortado no bounding box da marca. */
    mark: "/images/brand/logo-mark.svg",
    /** Rasters mantidos para contextos sem suporte a SVG (og:image, PDF, Excel). */
    trim: "/images/brand/official-trim.webp",
    full: "/images/brand/official-full.webp",
  },
  auth: {
    inspection: "/images/auth/inspection.webp",
  },
  vehicleBrands: (slug: string) => `/images/vehicle-brands/${slug}.webp` as const,
  consultations: {
    /** Fallback genérico; o hero da landing usa srcset 400/800. */
    hero: "/images/consultations/heroconsultations-800.webp",
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
    /** Vista superior do veículo — análise de pintura no PDF. */
    vehicleTopView: "/images/laudo/vehicle-top-view.webp",
    /** Imagens pictóricas por segmento (intro das seções do PDF) — WebP com alpha. */
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
