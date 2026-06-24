export function formatAuthError(message: string): string {
  const normalized = message.trim();
  if (/already been registered|already registered|user already exists/i.test(normalized)) {
    return "Já existe um usuário cadastrado com este endereço de e-mail.";
  }
  if (/invalid email|unable to validate email/i.test(normalized)) {
    return "O endereço de e-mail informado é inválido.";
  }
  if (/password/i.test(normalized) && /(weak|least|short|invalid)/i.test(normalized)) {
    return "A senha informada não atende aos requisitos mínimos de segurança.";
  }
  if (/duplicate key|unique constraint/i.test(normalized)) {
    return "Já existe um registro com estes dados. Verifique as informações informadas.";
  }
  return normalized;
}

export function jsonErrorResponse(
  message: string,
  corsHeaders: Record<string, string>,
  status = 400,
): Response {
  return new Response(JSON.stringify({ error: formatAuthError(message) }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
