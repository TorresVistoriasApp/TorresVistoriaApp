/** Remove tags HTML e caracteres de controle de entradas de usuário. */
export function sanitizeText(input: string, maxLength = 10_000): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex -- remover caracteres de controle é o objetivo aqui
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  return sanitizeText(email, 320).toLowerCase();
}

export function sanitizePlate(plate: string): string {
  return sanitizeText(plate, 8).replace(/[^A-Z0-9]/gi, "").toUpperCase();
}
