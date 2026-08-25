import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, User, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import {
  DuplicateEmailAlert,
  isDuplicateEmailError,
} from "@/core/auth/components/duplicate-email-alert";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { checkRateLimit, tooManyAttemptsMessage } from "@/core/auth/rate-limit";
import {
  consumerRegisterSchema,
  type ConsumerRegisterInput,
} from "@/core/auth/schemas/consumer-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ConsumerAuthPanel } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-panel";

export function ClienteRegisterPage() {
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [isFinalizingSignup, setIsFinalizingSignup] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerRegisterInput>({
    resolver: zodResolver(consumerRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    const normalized = values.email.trim().toLowerCase();
    const perEmail = checkRateLimit(`consulta-signup:${normalized}`, 3, 15 * 60 * 1000);
    const global = checkRateLimit("consulta-signup:global", 20, 15 * 60 * 1000);
    if (!perEmail.allowed || !global.allowed) {
      const retry = Math.max(perEmail.retryAfterMs, global.retryAfterMs);
      setError(tooManyAttemptsMessage(retry));
      return;
    }

    setIsFinalizingSignup(true);
    try {
      const { needsEmailConfirmation } = await consumerAuthService.signUp(values);
      if (needsEmailConfirmation) {
        setSuccessEmail(values.email);
        return;
      }
      navigate(ROUTES.consultaApp, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";
      setError(message);
    } finally {
      setIsFinalizingSignup(false);
    }
  });

  const handleResend = async () => {
    if (!successEmail) return;
    setResendPending(true);
    setResendMessage(null);
    try {
      await consumerAuthService.resendVerificationEmail(successEmail);
      setResendMessage("Link de confirmação reenviado. Verifique seu e-mail.");
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : "Não foi possível reenviar o e-mail de confirmação.",
      );
    } finally {
      setResendPending(false);
    }
  };

  if (successEmail) {
    return (
      <ConsumerAuthPanel
        title="Confirme seu e-mail"
        description={
          <>
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold text-foreground">{successEmail}</span>. Após confirmar,
            você poderá acessar sua conta.
          </>
        }
      >
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to={ROUTES.consultaLogin}>Voltar para o login</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={resendPending}
            onClick={() => void handleResend()}
          >
            {resendPending ? "Reenviando..." : "Reenviar confirmação"}
          </Button>
          {resendMessage && (
            <p className="text-sm leading-relaxed text-muted-foreground">{resendMessage}</p>
          )}
        </div>
      </ConsumerAuthPanel>
    );
  }

  if (isFinalizingSignup) {
    return (
      <div className="flex w-full max-w-[26rem] justify-center py-8">
        <LoadingSpinner label="Finalizando cadastro..." />
      </div>
    );
  }

  if (
    !sessionLoading &&
    !principalLoading &&
    session &&
    principalType === PrincipalType.CUSTOMER
  ) {
    return <Navigate to={ROUTES.consultaApp} replace />;
  }

  return (
    <ConsumerAuthPanel
      title="Criar conta grátis"
      description="Leva menos de um minuto. Você só paga quando gerar um relatório."
      footer={
        <>
          Já possui uma conta?{" "}
          <Link to={ROUTES.consultaLogin} className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
              aria-hidden
            />
            <Input id="name" autoComplete="name" className="pl-10" {...register("name")} />
          </div>
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <EmailField error={errors.email?.message} {...register("email")} />

        <PasswordStrengthInput
          id="password"
          label="Senha"
          value={password}
          onChange={(v) => setValue("password", v, { shouldValidate: true })}
          error={errors.password?.message}
        />

        <ConfirmPasswordField
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="space-y-2 border-t border-border pt-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/50 p-3.5 text-sm leading-relaxed transition-colors hover:bg-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
              {...register("acceptTerms")}
            />
            <span className="text-muted-foreground">
              Li e aceito os{" "}
              <Link
                to={ROUTES.termos}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Termos de Uso
              </Link>
              , a{" "}
              <Link
                to={ROUTES.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Política de Privacidade
              </Link>{" "}
              e consinto com o tratamento dos meus dados conforme a{" "}
              <Link
                to={ROUTES.lgpd}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                LGPD
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          )}
        </div>

        {error && isDuplicateEmailError(error) ? (
          <DuplicateEmailAlert />
        ) : error ? (
          <FormError message={error} />
        ) : null}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
          ) : (
            <>
              <UserPlus className="h-4 w-4" aria-hidden />
              Criar conta
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </ConsumerAuthPanel>
  );
}
