/** Remove caracteres não numéricos. */
export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, "").slice(0, 14);
}

export function isValidCnpj(value: string): boolean {
  const digits = normalizeCnpj(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    const sum = slice
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calcDigit(digits.slice(0, 12), firstWeights);
  if (firstDigit !== Number(digits[12])) return false;

  const secondDigit = calcDigit(digits.slice(0, 13), secondWeights);
  return secondDigit === Number(digits[13]);
}
