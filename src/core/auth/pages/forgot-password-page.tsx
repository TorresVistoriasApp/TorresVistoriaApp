import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { checkRateLimit, tooManyAttemptsMessage } from "@/core/auth/rate-limit";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/core/auth/schemas/auth";
import { EmailField } from "@/core/auth/components/email-field";
import { TenantAuthPanel } from "@/core/auth/components/tenant-auth-panel";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setMessage(null);
    setError(null);

    const normalized = email.trim().toLowerCase();
    const perEmail = checkRateLimit(`reset:${normalized}`, 3, 15 * 60 * 1000);
    const global = checkRateLimit("reset:global", 20, 15 * 60 * 1000);
    if (!perEmail.allowed || !global.allowed) {
      const retry = Math.max(perEmail.retryAfterMs, global.retryAfterMs);
      setError(tooManyAttemptsMessage(retry));
      return;
    }

    try {
      await resetPassword(email);
      setMessage("Se o e-mail estiver cadastrado, enviaremos um link de recuperação.");
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : formatUserFacingError(getErrorMessage(err));
      setError(message);
    }
  });

  return (
    <TenantAuthPanel title="Recuperar senha" description="Informe seu e-mail cadastrado.">
      <form onSubmit={onSubmit} className="space-y-4">
        <EmailField
          placeholder="seu@email.com"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          error={errors.email?.message}
          {...register("email")}
        />
        {message && <p className="text-sm text-success">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </TenantAuthPanel>
  );
}
