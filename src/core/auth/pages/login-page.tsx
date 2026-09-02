import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { checkRateLimit, formatRetryAfter, resetRateLimit } from "@/core/auth/rate-limit";
import { logger } from "@/core/observability/logger";
import { saveLgpdConsent } from "@/core/compliance/lgpd";
import { loginSchema, type LoginInput } from "@/core/auth/schemas/auth";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordField } from "@/core/auth/components/password-field";
import { TenantAuthPanel } from "@/core/auth/components/tenant-auth-panel";
import { useTurnstile } from "@/core/security/use-turnstile";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";
import { homeForPrincipal } from "@/routes/panel";

export function LoginPage() {
  const { signIn, session, loading } = useAuth();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const turnstile = useTurnstile("login-tenant");
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
      <div className="flex flex-1 justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }
  if (session && principalType) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const limit = checkRateLimit("login", 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      setError(`Muitas tentativas. Tente novamente em ${formatRetryAfter(limit.retryAfterMs)}.`);
      return;
    }
    try {
      await signIn(values.email, values.password, turnstile.ensureToken());
      saveLgpdConsent(false);
      resetRateLimit("login");
    } catch (err) {
      logger.warn("Falha no login");
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  });

  return (
    <TenantAuthPanel
      title="Acesse o painel Torres"
      meta="Conta Torres Vistoria"
      description="Entre para emitir laudos, gerenciar vistorias e acompanhar sua operação."
      cta={
        <Link
          to={ROUTES.vistoriaRegister}
          className="group relative block w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-white via-[#fff8f3] to-primary/[0.08] p-4 shadow-[0_10px_28px_rgb(16_21_28_/_0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_36px_rgb(232_104_42_/_0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-5"
        >
          <span
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-[#ff9a5c] to-primary/70"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-[transform,opacity] duration-700 group-hover:translate-x-[120%] group-hover:opacity-100"
            aria-hidden
          />

          <div className="relative flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_0_4px_rgb(232_104_42_/_0.06)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                Novo vistoriador?
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-foreground">
                Criar conta profissional
                <ArrowRight
                  className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted-foreground">
                Cadastro grátis. Acesso liberado após aprovação da equipe Torres.
              </p>
            </div>
          </div>
        </Link>
      }
      footer={
        <Link
          to={ROUTES.consultaLanding}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[rgb(16_21_28_/_0.08)] bg-white/60 px-4 py-3.5 text-center text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/25 hover:text-foreground"
        >
          Não é vistoriador?
          <span className="font-semibold text-primary">Consultar veículo</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form" aria-busy={isSubmitting}>
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
              className="text-xs font-semibold tracking-wide text-primary hover:underline"
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

        {turnstile.field}

        <Button type="submit" className="h-12 w-full shadow-glow" size="lg" disabled={isSubmitting}>
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
              Entrar no painel
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </TenantAuthPanel>
  );
}
