export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (p) => p.length >= 8 },
  { id: "uppercase", label: "Uma letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { id: "special", label: "Um caractere especial (ex.: !@#$%)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: "lowercase", label: "Uma letra minúscula", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "Um número", test: (p) => /[0-9]/.test(p) },
];

export function getPasswordStrength(password: string): number {
  return PASSWORD_REQUIREMENTS.filter((req) => req.test(password)).length;
}

export function isStrongPassword(password: string): boolean {
  return getPasswordStrength(password) === PASSWORD_REQUIREMENTS.length;
}

export const STRONG_PASSWORD_MESSAGE =
  "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial";
