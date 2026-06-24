export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Senha deve ter no mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Senha deve conter uma letra maiúscula";
  if (!/[a-z]/.test(password)) return "Senha deve conter uma letra minúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter um número";
  if (!/[^A-Za-z0-9]/.test(password)) return "Senha deve conter um caractere especial";
  return null;
}
