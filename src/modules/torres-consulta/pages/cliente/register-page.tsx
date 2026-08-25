import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, User, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  AuthRegisterFrame,
  AuthRegisterLegal,
  AuthRegisterSection,
  AuthRegisterSubmitBar,
  AuthRegisterSuccess,
  AuthRegisterTermsLinks,
} from "@/core/auth/components/auth-register-shell";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import {
  DuplicateEmailAlert,
  isDuplicateEmailError,
} from "@/core/auth/components/duplicate-email-alert";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput, PasswordRulesBar } from "@/core/auth/components/password-strength-input";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { checkRateLimit, tooManyAttemptsMessage } from "@/core/auth/rate-limit";
import {
  consumerRegisterSchema,
  type ConsumerRegisterInput,
} from "@/core/auth/schemas/consumer-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { homeForPrincipal } from "@/routes/panel";
import { FormField } from "@/shared/components/forms/form-field";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

const REGISTER_STEPS = ["Crie a conta", "Confirme o e-mail", "Consulte veículos"] as const;

const SUCCESS_STEPS = [
  "Confirme o e-mail pelo link que enviamos.",
  "Entre na sua conta Torres Consulta.",
  "Consulte veículos e salve os relatórios.",
] as const;

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
    formState: { errors, isSubmitted, isSubmitting },
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
      <AuthRegisterSuccess
        email={successEmail}
        loginTo={ROUTES.consultaLogin}
        nextSteps={SUCCESS_STEPS}
        onResend={() => void handleResend()}
        resendPending={resendPending}
        resendMessage={resendMessage}
      />
    );
  }

  if (sessionLoading || principalLoading || isFinalizingSignup) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label={isFinalizingSignup ? "Finalizando cadastro..." : "Carregando..."} />
      </div>
    );
  }

  if (session && principalType) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  return (
    <AuthRegisterFrame
      backTo={ROUTES.consultaLogin}
      eyebrow="Cadastro de cliente"
      title={
        <>
          Crie sua conta na <span className="text-primary">Torres Consulta</span>
        </>
      }
      description="Gratuito. Você só paga ao gerar um relatório."
      steps={REGISTER_STEPS}
    >
      <form onSubmit={onSubmit} noValidate data-testid="consulta-register-form" aria-busy={isSubmitting}>
        <AuthRegisterSection legend="Seus dados">
          <FormField label="Nome completo" error={errors.name?.message}>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                placeholder="Como no seu documento"
                className="touch-target pl-11"
                {...register("name")}
              />
            </div>
          </FormField>

          <EmailField
            id="email"
            placeholder="seu@email.com"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            error={errors.email?.message}
            {...register("email")}
          />
        </AuthRegisterSection>

        <AuthRegisterSection
          legend="Acesso à conta"
          bordered
          footer={
            <PasswordRulesBar
              value={password}
              invalid={isSubmitted && Boolean(errors.password)}
              className="mt-3"
            />
          }
        >
          <PasswordStrengthInput
            compact
            showDetails={false}
            id="password"
            label="Senha"
            value={password}
            onChange={(v) => setValue("password", v, { shouldValidate: true })}
          />

          <ConfirmPasswordField
            enterKeyHint="go"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </AuthRegisterSection>

        <AuthRegisterLegal
          checkboxProps={register("acceptTerms")}
          error={errors.acceptTerms?.message}
          alert={
            error && isDuplicateEmailError(error) ? (
              <DuplicateEmailAlert
                loginRoute={ROUTES.consultaLogin}
                forgotPasswordRoute={ROUTES.consultaForgotPassword}
              />
            ) : error ? (
              <FormError message={error} />
            ) : null
          }
        >
          <AuthRegisterTermsLinks />
        </AuthRegisterLegal>

        <AuthRegisterSubmitBar loginTo={ROUTES.consultaLogin}>
          <Button type="submit" className="h-11 sm:min-w-[15rem]" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden
                />
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" aria-hidden />
                Criar conta
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        </AuthRegisterSubmitBar>
      </form>
    </AuthRegisterFrame>
  );
}
