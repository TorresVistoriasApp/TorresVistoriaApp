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
import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";
import {
  inspectorRegisterSchema,
  type InspectorRegisterInput,
} from "@/core/auth/schemas/inspector-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import type { InspectorDocumentType } from "@/core/auth/validators/document";
import { BrandLogo } from "@/shared/components/brand-logo";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingScreen } from "@/shared/components/loading-spinner";

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
      acceptPrivacy: false,
      consentDataProcessing: false,
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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Confirme seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link para <span className="font-medium">{successEmail}</span>. Após
              confirmar, seu cadastro será analisado pela equipe Torres antes do acesso ao painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full touch-target"
              disabled={resendPending}
              onClick={() => void handleResend()}
            >
              {resendPending ? "Reenviando..." : "Reenviar confirmação"}
            </Button>
            {resendMessage && <p className="text-sm text-muted-foreground">{resendMessage}</p>}
            <Button asChild className="w-full touch-target">
              <Link to={ROUTES.login}>Voltar para login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <BrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Cadastro de vistoriador</CardTitle>
          <CardDescription>
            Crie sua conta para operar no Torres Vistoria. O acesso é liberado após aprovação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="pl-11 touch-target" {...register("name")} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <EmailField error={errors.email?.message} {...register("email")} />

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(00) 00000-0000" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <CpfCnpjField
              control={control}
              documentType={documentType}
              onDocumentTypeChange={(type) => {
                setValue("documentType", type, { shouldValidate: true });
                setValue("document", "", { shouldValidate: true });
              }}
              errors={errors}
            />

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

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded" {...register("acceptTerms")} />
                <span>
                  Aceito os{" "}
                  <Link to={ROUTES.termos} className="font-semibold text-primary hover:underline">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded"
                  {...register("acceptPrivacy")}
                />
                <span>
                  Aceito a{" "}
                  <Link to={ROUTES.privacy} className="font-semibold text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p className="text-sm text-destructive">{errors.acceptPrivacy.message}</p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded"
                  {...register("consentDataProcessing")}
                />
                <span>Consinto com o tratamento dos meus dados pessoais conforme a LGPD.</span>
              </label>
              {errors.consentDataProcessing && (
                <p className="text-sm text-destructive">{errors.consentDataProcessing.message}</p>
              )}
            </div>

            {error && isDuplicateEmailError(error) ? (
              <DuplicateEmailAlert />
            ) : error ? (
              <FormError message={error} />
            ) : null}

            <Button type="submit" className="w-full touch-target" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
