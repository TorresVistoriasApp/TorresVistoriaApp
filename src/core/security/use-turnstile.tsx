import { useState, type ReactNode } from "react";
import { AppError } from "@/core/errors/app-error";
import { isTurnstileEnabled } from "@/config/turnstile";
import { TurnstileWidget } from "@/core/security/turnstile-widget";

export function useTurnstile(action: string): {
  field: ReactNode;
  token: string | null;
  required: boolean;
  ensureToken: () => string | undefined;
} {
  const required = isTurnstileEnabled();
  const [token, setToken] = useState<string | null>(null);

  const field = required ? <TurnstileWidget action={action} onToken={setToken} /> : null;

  function ensureToken(): string | undefined {
    if (!required) return undefined;
    if (!token) {
      throw new AppError("Conclua a verificação anti-bot antes de continuar.");
    }
    return token;
  }

  return { field, token, required, ensureToken };
}
