/** Validação de CPF/CNPJ no Edge de cadastro. Espelha src/core/auth/validators. */

export function normalizeDocumentDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const digits = normalizeDocumentDigits(value).slice(0, 11);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === Number(digits[10]);
}

export function isValidCnpj(value: string): boolean {
  const digits = normalizeDocumentDigits(value).slice(0, 14);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstDigit !== Number(digits[12])) return false;
  const secondDigit = calcDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return secondDigit === Number(digits[13]);
}

export function isValidInspectorDocument(value: string, type: "cpf" | "cnpj"): boolean {
  return type === "cpf" ? isValidCpf(value) : isValidCnpj(value);
}
