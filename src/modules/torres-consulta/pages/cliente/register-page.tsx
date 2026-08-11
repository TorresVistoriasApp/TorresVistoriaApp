import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
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
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerRegisterSchema,
  type ConsumerRegisterInput,
} from "@/core/auth/schemas/consumer-auth";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingScreen } from "@/shared/components/loading-spinner";

export function ClienteRegisterPage() {
  const { principalType, loading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
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
      acceptPrivacy: false,
      consentDataProcessing: false,
    },
  });

  const password = watch("password");

  if (loading) return <LoadingScreen />;
  if (principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={ROUTES.consultaApp} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consumerAuthService.signUp(values);
      setSuccessEmail(values.email);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";
      setError(message);
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
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Confirme seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação para <span className="font-medium">{successEmail}</span>.
              Após confirmar, você poderá acessar sua conta.
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
              <Link to={ROUTES.consultaLogin}>Voltar para login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>Cadastro gratuito para consultas veiculares.</CardDescription>
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

            <PasswordStrengthInput
              id="password"
              label="Senha"
              value={password}
              onChange={(v) => setValue("password", v, { shouldValidate: true })}
              error={errors.password?.message}
            />

            <ConfirmPasswordField error={errors.confirmPassword?.message} {...register("confirmPassword")} />

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
                <input type="checkbox" className="mt-1 h-4 w-4 rounded" {...register("acceptPrivacy")} />
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
                  Criar conta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já possui uma conta?{" "}
              <Link to={ROUTES.consultaLogin} className="font-semibold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
