/**
 * Controle temporário da obrigatoriedade de fotografias.
 * Defina como `true` quando a regra for reativada.
 */
export const PHOTO_REQUIREMENTS_ENABLED = false;

export function isPhotoRequirementActive(required?: boolean | null): boolean {
  return PHOTO_REQUIREMENTS_ENABLED && Boolean(required);
}
