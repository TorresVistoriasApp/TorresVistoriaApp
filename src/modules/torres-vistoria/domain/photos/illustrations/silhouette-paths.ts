/**
 * Silhueta sedan — vista lateral (contorno profissional, proporções reais).
 * Base para identificação externa, pintura e rodas.
 */
export const SEDAN_SIDE_BODY = `
  M 22 118
  L 26 96
  C 28 80 36 66 50 54
  C 62 44 78 36 98 32
  C 118 28 140 28 160 32
  C 180 36 196 46 206 60
  C 214 72 218 86 218 100
  L 220 118
  L 206 118
  C 204 104 196 94 184 94
  C 172 94 164 104 162 118
  L 84 118
  C 82 104 74 94 62 94
  C 50 94 42 104 40 118
  Z
`;

export const SEDAN_SIDE_WINDOWS = `
  M 78 52
  L 92 38
  L 148 38
  L 162 52
  L 148 68
  L 118 68
  L 92 68
  Z
  M 100 68
  L 100 88
  M 138 68
  L 138 88
`;

export const SEDAN_FRONT_BODY = `
  M 44 128
  L 52 72
  C 56 48 76 32 120 26
  C 164 32 184 48 188 72
  L 196 128
  Z
`;

export const SEDAN_REAR_BODY = `
  M 44 128
  L 52 74
  C 56 50 76 34 120 28
  C 164 34 184 50 188 74
  L 196 128
  Z
`;

export const SEDAN_TOP_BODY = `
  M 52 88
  L 72 48
  L 168 48
  L 188 88
  L 168 128
  L 72 128
  Z
`;

/** Rodas — posições vista lateral */
export const SEDAN_SIDE_WHEELS = {
  front: { cx: 62, cy: 118, r: 16 },
  rear: { cx: 184, cy: 118, r: 16 },
} as const;
