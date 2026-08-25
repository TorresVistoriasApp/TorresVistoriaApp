import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAuthRedirectUrl } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { checkRateLimit, tooManyAttemptsMessage } from "@/core/auth/rate-limit";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerForgotPasswordSchema,
  type ConsumerForgotPasswordInput,
} from "@/core/auth/schemas/consumer-auth";
import { Button } from "@/shared/ui/button";
import { ConsumerAuthPanel } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-panel";

export function ClienteForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerForgotPasswordInput>({
    resolver: zodResolver(consumerForgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    const normalized = values.email.trim().toLowerCase();
    const perEmail = checkRateLimit(`consulta-reset:${normalized}`, 3, 15 * 60 * 1000);
    const global = checkRateLimit("consulta-reset:global", 20, 15 * 60 * 1000);
    if (!perEmail.allowed || !global.allowed) {
      const retry = Math.max(perEmail.retryAfterMs, global.retryAfterMs);
      setError(tooManyAttemptsMessage(retry));
      return;
    }

    try {
      const redirectTo = getAuthRedirectUrl(ROUTES.consultaResetPassword);
      await consumerAuthService.resetPassword(values, redirectTo);
      setSent(true);
    } catch (err) {
      const message =
        err instanceof AppError
          ? err.message
          : formatUserFacingError(getErrorMessage(err));
      setError(message);
    }
  });

  return (
    <ConsumerAuthPanel
      title="Recuperar acesso"
      meta="Torres Consulta"
      description={
        sent
          ? "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes."
          : "Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      }
      footer={
        <Link
          to={ROUTES.consultaLogin}
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar para o login
        </Link>
      }
    >
      {!sent ? (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <EmailField error={errors.email?.message} {...register("email")} />
          {error && <FormError message={error} />}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>
      ) : (
        <Button asChild size="lg" className="w-full">
          <Link to={ROUTES.consultaLogin}>Voltar ao login</Link>
        </Button>
      )}
    </ConsumerAuthPanel>
  );
}
