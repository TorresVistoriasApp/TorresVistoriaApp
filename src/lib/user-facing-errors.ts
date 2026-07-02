const ERROR_TRANSLATIONS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /already been registered|already registered|user already exists|email address is already/i,
    message: "Já existe um usuário cadastrado com este endereço de e-mail.",
  },
  {
    pattern: /invalid login credentials|invalid credentials/i,
    message: "Credenciais inválidas. Verifique o e-mail e a senha informados.",
  },
  {
    pattern: /email not confirmed|email address not confirmed/i,
    message: "O endereço de e-mail ainda não foi confirmado.",
  },
  {
    pattern: /invalid email|unable to validate email|email format/i,
    message: "O endereço de e-mail informado é inválido.",
  },
  {
    pattern: /password should be at least|password is too weak|weak password/i,
    message: "A senha informada não atende aos requisitos mínimos de segurança.",
  },
  {
    pattern: /not authorized|unauthorized|access denied|acesso negado/i,
    message: "Você não possui permissão para executar esta operação.",
  },
  {
    pattern:
      /not authenticated|missing authorization|jwt expired|session expired|"exp"\s+claim|exp claim/i,
    message: "Sua sessão expirou ou não está autenticada. Efetue login novamente.",
  },
  {
    pattern: /not found|404|requested function was not found/i,
    message:
      "O serviço de gestão de usuários não está disponível. Entre em contato com o suporte técnico.",
  },
  {
    pattern: /failed to fetch|network|edge function|non-2xx/i,
    message: "Não foi possível comunicar com o servidor. Verifique sua conexão e tente novamente.",
  },
  {
    pattern: /duplicate key|unique constraint/i,
    message: "Já existe um registro com estes dados. Verifique as informações informadas.",
  },
  {
    pattern: /cannot deactivate your own|desativar sua própria/i,
    message: "Não é permitido desativar a própria conta de acesso.",
  },
  {
    pattern: /does not belong|não pertence/i,
    message: "O usuário selecionado não pertence à sua empresa.",
  },
];

const FORMAL_FALLBACK =
  "Não foi possível concluir a operação. Tente novamente ou entre em contato com o suporte.";

function looksPortuguese(message: string): boolean {
  return /[áàâãéêíóôõúç]/i.test(message) || /\b(não|senha|usuário|e-mail|cadastr|permissão|sessão)\b/i.test(message);
}

export function formatUserFacingError(message: string): string {
  const normalized = message.trim();
  if (!normalized) return FORMAL_FALLBACK;

  for (const { pattern, message: translated } of ERROR_TRANSLATIONS) {
    if (pattern.test(normalized)) return translated;
  }

  if (looksPortuguese(normalized)) return normalized;

  return FORMAL_FALLBACK;
}

export const USER_MESSAGES = {
  createSuccess: "Usuário cadastrado com sucesso.",
  updateSuccess: "Dados do usuário atualizados com sucesso.",
  deactivateSuccess: "Acesso do usuário desativado com sucesso.",
  reactivateSuccess: "Acesso do usuário reativado com sucesso.",
  createFailed: "Não foi possível cadastrar o usuário.",
  updateFailed: "Não foi possível atualizar os dados do usuário.",
  statusFailed: "Não foi possível alterar o status de acesso do usuário.",
  accountDisabled:
    "A conta encontra-se desativada. Entre em contato com o administrador do sistema.",
  notAuthenticated: "Sessão não autenticada. Efetue login novamente.",
  emptyFunctionResponse: "O servidor não retornou resposta para a operação solicitada.",
} as const;
