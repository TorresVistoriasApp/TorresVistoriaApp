import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, UserPlus } from "lucide-react";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { checkRateLimit, formatRetryAfter, resetRateLimit } from "@/core/auth/rate-limit";
import { logger } from "@/core/observability/logger";
import { saveLgpdConsent } from "@/core/compliance/lgpd";
import { loginSchema, type LoginInput } from "@/core/auth/schemas/auth";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordField } from "@/core/auth/components/password-field";
import { TenantAuthPanel } from "@/core/auth/components/tenant-auth-panel";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

export function LoginPage() {
  const { signIn, session, loading } = useAuth();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { acceptTerms: false },
  });

  if (loading || (session && principalLoading)) {
    return (
      <div className="lg:col-start-2 lg:row-start-2">
        <LoadingSpinner />
      </div>
    );
  }
  if (session && principalType === PrincipalType.TENANT_MEMBER) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }
  if (session && principalType === PrincipalType.PLATFORM_ADMIN) {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }
  if (session && principalType === PrincipalType.PENDING_INSPECTOR) {
    return <Navigate to={ROUTES.vistoriaPendingApproval} replace />;
  }
  if (session && principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={ROUTES.consultaApp} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const limit = checkRateLimit("login", 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      setError(`Muitas tentativas. Tente novamente em ${formatRetryAfter(limit.retryAfterMs)}.`);
      return;
    }
    try {
      await signIn(values.email, values.password);
      saveLgpdConsent(false);
      resetRateLimit("login");
    } catch (err) {
      logger.warn("Falha no login");
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  });

  return (
    <TenantAuthPanel
      title="Entrar no painel"
      meta="Use sua conta Torres Vistorias"
      cta={
        <Link
          to={ROUTES.vistoriaRegister}
          className="group flex items-center gap-3 rounded-xl border border-brand-border bg-brand-subtle p-3.5 transition-colors duration-150 hover:bg-brand-muted"
        >
          <span className="ui-icon-box h-10 w-10">
            <UserPlus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="ui-eyebrow">Ainda não tem cadastro?</span>
            <span className="mt-1 block text-sm font-bold text-foreground">
              Criar conta de vistoriador
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              Cadastro gratuito, liberado após aprovação da equipe.
            </span>
          </span>
          <ArrowRight
            className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      }
      footer={
        <Link
          to={ROUTES.consultaLanding}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-center text-sm text-muted-foreground shadow-card transition-colors duration-150 hover:text-foreground"
        >
          Não é vistoriador?
          <span className="font-semibold text-primary">Consultar veículo</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3.5" data-testid="login-form" aria-busy={isSubmitting}>
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
        <PasswordField
          id="password"
          enterKeyHint="go"
          error={errors.password?.message}
          labelAction={
            <Link
              to={ROUTES.forgotPassword}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          }
          {...register("password")}
        />

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
            {...register("acceptTerms")}
          />
          <span>
            Li e concordo com a{" "}
            <Link
              to={ROUTES.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link
              to={ROUTES.termos}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Termos de Uso
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}

        {error && <FormError message={error} />}

        <Button type="submit" className="h-12 w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
              Entrando...
            </>
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </TenantAuthPanel>
  );
}
