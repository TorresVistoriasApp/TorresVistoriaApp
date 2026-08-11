import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, User, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import { CpfCnpjField } from "@/core/auth/components/cpf-cnpj-field";
import {
  DuplicateEmailAlert,
  isDuplicateEmailError,
} from "@/core/auth/components/duplicate-email-alert";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { TenantAuthPanel } from "@/core/auth/components/tenant-auth-panel";
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
import { LoadingScreen } from "@/shared/components/loading-spinner";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

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
    formState: { errors, isSubmitting },
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

  if (loading) return <LoadingScreen />;
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
      <TenantAuthPanel
        title="Confirme seu e-mail"
        description={`Enviamos um link de confirmação para ${successEmail}.`}
      >
        <ol className="mb-6 space-y-3">
          {[
            "Confirme o e-mail pelo link que enviamos.",
            "Nossa equipe analisa seu cadastro.",
            "Você recebe o aviso de acesso liberado.",
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <Button asChild className="h-12 w-full rounded-2xl text-base font-semibold">
            <Link to={ROUTES.login}>Voltar para login</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full touch-target"
            disabled={resendPending}
            onClick={() => void handleResend()}
          >
            {resendPending ? "Reenviando..." : "Reenviar confirmação"}
          </Button>
          {resendMessage && (
            <p className="text-center text-sm text-muted-foreground">{resendMessage}</p>
          )}
        </div>
      </TenantAuthPanel>
    );
  }

  return (
    <TenantAuthPanel
      wide
      title="Criar conta"
      description="Cadastro para vistoriadores. O acesso é liberado após aprovação da equipe."
    >
      <form onSubmit={onSubmit} className="space-y-6" aria-busy={isSubmitting}>
        <fieldset className="space-y-4">
          <SectionLabel>Seus dados</SectionLabel>

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
            placeholder="(00) 00000-0000"
            hint="Usamos apenas para falar sobre a aprovação do cadastro."
            error={errors.phone?.message}
            inputClassName="touch-target"
          />

          <CpfCnpjField
            control={control}
            documentType={documentType}
            onDocumentTypeChange={(type) => {
              setValue("documentType", type, { shouldValidate: true });
              setValue("document", "", { shouldValidate: false });
            }}
            errors={errors}
          />
        </fieldset>

        <fieldset className="space-y-4 border-t border-border/60 pt-6">
          <SectionLabel>Acesso ao painel</SectionLabel>

          <PasswordStrengthInput
            id="password"
            label="Senha"
            value={password}
            onChange={(v) => setValue("password", v, { shouldValidate: true })}
            error={errors.password?.message}
          />

          <ConfirmPasswordField
            enterKeyHint="go"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </fieldset>

        <div className="space-y-3 border-t border-border/60 pt-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-muted/25 p-4 text-sm leading-relaxed transition-colors hover:bg-muted/40">
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
              </Link>{" "}
              e a{" "}
              <Link
                to={ROUTES.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                Política de Privacidade
              </Link>
              , e consinto com o tratamento dos meus dados conforme a{" "}
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
            <DuplicateEmailAlert />
          ) : error ? (
            <FormError message={error} />
          ) : null}

          <Button
            type="submit"
            className="h-12 w-full rounded-2xl text-base font-semibold"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Solicitar cadastro
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </TenantAuthPanel>
  );
}
