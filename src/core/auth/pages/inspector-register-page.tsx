import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Phone, User, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import { CpfCnpjField } from "@/core/auth/components/cpf-cnpj-field";
import {
  DuplicateEmailAlert,
  isDuplicateEmailError,
} from "@/core/auth/components/duplicate-email-alert";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput, PasswordRulesBar } from "@/core/auth/components/password-strength-input";
import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";
import {
  inspectorRegisterSchema,
  type InspectorRegisterInput,
} from "@/core/auth/schemas/inspector-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import type { InspectorDocumentType } from "@/core/auth/validators/document";
import { FormField } from "@/shared/components/forms/form-field";
import { MaskedField } from "@/shared/components/forms/masked-fields";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { cn } from "@/shared/lib/utils";

const REGISTER_STEPS = ["Envie os dados", "Confirme o e-mail", "Aguarde a aprovação"] as const;

export function InspectorRegisterPage() {
  const { principalType, loading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted, isSubmitting },
  } = useForm<InspectorRegisterInput>({
    resolver: zodResolver(inspectorRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      documentType: "cpf",
      document: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");
  const documentType = watch("documentType") as InspectorDocumentType;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (principalType === PrincipalType.TENANT_MEMBER) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  if (principalType === PrincipalType.PENDING_INSPECTOR) {
    return <Navigate to={ROUTES.vistoriaPendingApproval} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await inspectorAuthService.signUp(values);
      setSuccessEmail(values.email);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.",
      );
    }
  });

  const handleResend = async () => {
    if (!successEmail) return;
    setResendPending(true);
    setResendMessage(null);
    try {
      await inspectorAuthService.resendVerificationEmail(successEmail);
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
      <div className="mx-auto max-w-md">
        <p className="ui-eyebrow">Cadastro enviado</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Confirme seu <span className="text-primary">e-mail</span>
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enviamos um link para <span className="font-semibold text-foreground">{successEmail}</span>.
        </p>

        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-elevated">
          <ol className="space-y-3">
            {[
              "Confirme o e-mail pelo link que enviamos.",
              "Nossa equipe analisa seu cadastro.",
              "Você recebe o aviso de acesso liberado.",
            ].map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="ui-icon-box ui-metric h-6 w-6 shrink-0 rounded-full text-[11px] font-bold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-5 space-y-2.5">
            <Button asChild className="h-11 w-full" size="lg">
              <Link to={ROUTES.login}>Voltar para login</Link>
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
              <p className="text-center text-sm text-muted-foreground">{resendMessage}</p>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={ROUTES.login}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar ao login
      </Link>

      <div className="mt-4 sm:mt-5">
        <p className="ui-eyebrow">Cadastro de vistoriador</p>
        <h1 className="mt-2 text-balance text-2xl font-bold leading-tight text-foreground sm:text-[1.75rem]">
          Solicite acesso ao <span className="text-primary">painel</span>
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Gratuito. Depois do envio, confirme o e-mail e aguarde a aprovação.
        </p>
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <ol className="flex border-b border-border sm:grid sm:grid-cols-3">
          {REGISTER_STEPS.map((step, index) => {
            const current = index === 0;
            return (
              <li
                key={step}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2.5 sm:px-4",
                  index < REGISTER_STEPS.length - 1 && "border-r border-border",
                  current ? "flex-1 bg-brand-subtle" : "shrink-0",
                )}
              >
                {current ? (
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden />
                ) : null}
                <span
                  className={cn(
                    "ui-metric flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    current
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-xs",
                    current
                      ? "font-semibold text-foreground"
                      : "hidden font-medium text-muted-foreground sm:inline",
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>

        <form onSubmit={onSubmit} data-testid="register-form" aria-busy={isSubmitting}>
          <fieldset className="p-4 sm:p-5">
            <legend className="ui-microlabel">Seus dados</legend>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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

              <MaskedField
                control={control}
                name="phone"
                label="Telefone"
                mask="phone"
                optional
                icon={Phone}
                placeholder="(00) 00000-0000"
                error={errors.phone?.message}
                inputClassName="touch-target"
              />

              <CpfCnpjField
                compact
                control={control}
                documentType={documentType}
                onDocumentTypeChange={(type) => {
                  setValue("documentType", type, { shouldValidate: true });
                  setValue("document", "", { shouldValidate: false });
                }}
                errors={errors}
              />
            </div>
          </fieldset>

          <fieldset className="border-t border-border p-4 sm:p-5">
            <legend className="ui-microlabel">Acesso ao painel</legend>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
            </div>

            <PasswordRulesBar
              value={password}
              invalid={isSubmitted && Boolean(errors.password)}
              className="mt-3"
            />
          </fieldset>

          <div className="space-y-3 border-t border-border p-4 sm:p-5">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border p-3 text-sm leading-relaxed text-muted-foreground transition-colors duration-150 hover:border-brand-border hover:bg-brand-subtle">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
                {...register("acceptTerms")}
              />
              <span>
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
                e a{" "}
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

            {error && isDuplicateEmailError(error) ? (
              <DuplicateEmailAlert
                loginRoute={ROUTES.login}
                forgotPasswordRoute={ROUTES.forgotPassword}
              />
            ) : error ? (
              <FormError message={error} />
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-border bg-muted p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <Button type="submit" className="h-11 sm:min-w-[15rem]" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" aria-hidden />
                  Solicitar cadastro
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Já possui uma conta?{" "}
              <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
