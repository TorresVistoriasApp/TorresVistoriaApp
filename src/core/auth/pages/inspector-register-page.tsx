import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { ArrowRight, Phone, User, UserPlus } from "lucide-react";
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
import { CpfCnpjField } from "@/core/auth/components/cpf-cnpj-field";
import {
  DuplicateEmailAlert,
  isDuplicateEmailError,
} from "@/core/auth/components/duplicate-email-alert";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput, PasswordRulesBar } from "@/core/auth/components/password-strength-input";
import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";
import { useTurnstile } from "@/core/security/use-turnstile";
import {
  inspectorRegisterSchema,
  type InspectorRegisterInput,
} from "@/core/auth/schemas/inspector-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { homeForPrincipal } from "@/routes/panel";
import type { InspectorDocumentType } from "@/core/auth/validators/document";
import { FormField } from "@/shared/components/forms/form-field";
import { MaskedField } from "@/shared/components/forms/masked-fields";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

const REGISTER_STEPS = ["Envie os dados", "Confirme o e-mail", "Aguarde a aprovação"] as const;

const SUCCESS_STEPS = [
  "Confirme o e-mail pelo link que enviamos.",
  "Nossa equipe analisa seu cadastro.",
  "Você recebe o aviso de acesso liberado.",
] as const;

export function InspectorRegisterPage() {
  const { principalType, loading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const turnstile = useTurnstile("signup-inspector");

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
  if (principalType) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await inspectorAuthService.signUp(values, turnstile.ensureToken());
      setSuccessEmail(values.email);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";
      if (isDuplicateEmailError(message)) {
        setSuccessEmail(values.email);
        return;
      }
      setError(message);
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
      <AuthRegisterSuccess
        email={successEmail}
        loginTo={ROUTES.login}
        nextSteps={SUCCESS_STEPS}
        onResend={() => void handleResend()}
        resendPending={resendPending}
        resendMessage={resendMessage}
      />
    );
  }

  return (
    <AuthRegisterFrame
      backTo={ROUTES.login}
      eyebrow="Cadastro de vistoriador"
      title={
        <>
          Solicite acesso ao <span className="text-primary">painel</span>
        </>
      }
      description="Gratuito. Depois do envio, confirme o e-mail e aguarde a aprovação."
      steps={REGISTER_STEPS}
    >
      <form onSubmit={onSubmit} data-testid="register-form" aria-busy={isSubmitting}>
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
        </AuthRegisterSection>

        <AuthRegisterSection
          legend="Acesso ao painel"
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
                loginRoute={ROUTES.login}
                forgotPasswordRoute={ROUTES.forgotPassword}
              />
            ) : error ? (
              <FormError message={error} />
            ) : null
          }
        >
          <AuthRegisterTermsLinks />
        </AuthRegisterLegal>

        {turnstile.field}

        <AuthRegisterSubmitBar loginTo={ROUTES.login}>
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
        </AuthRegisterSubmitBar>
      </form>
    </AuthRegisterFrame>
  );
}
