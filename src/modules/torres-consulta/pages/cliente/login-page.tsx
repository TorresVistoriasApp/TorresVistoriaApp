import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordField } from "@/core/auth/components/password-field";
import { useSession } from "@/core/auth/session-context";
import { useAuth } from "@/core/auth/use-auth";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerLoginSchema,
  type ConsumerLoginInput,
} from "@/core/auth/schemas/consumer-auth";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { usePrincipal } from "@/core/auth/use-principal";
import { ConsumerAuthPanel } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-panel";
import { MfaChallengeForm } from "@/core/auth/components/mfa-challenge-form";
import { useTurnstile } from "@/core/security/use-turnstile";
import { resolvePostAuthPath } from "@/routes/panel";

export function ClienteLoginPage() {
  const location = useLocation();
  const { session, loading: sessionLoading } = useSession();
  const { mfaPending, completeMfa, signOut, loading: authLoading } = useAuth();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const turnstile = useTurnstile("login-consumer");

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerLoginInput>({
    resolver: zodResolver(consumerLoginSchema),
    defaultValues: { acceptTerms: false },
  });

  if (sessionLoading || isSigningIn || authLoading) {
    return (
      <div className="flex flex-1 justify-center py-12">
        <LoadingSpinner label={isSigningIn ? "Entrando..." : "Carregando..."} />
      </div>
    );
  }

  if (session && mfaPending) {
    return (
      <ConsumerAuthPanel
        title="Confirme o acesso"
        meta="Verificação em duas etapas"
        description="Abra o aplicativo autenticador e informe o código de 6 dígitos."
      >
        <MfaChallengeForm onVerify={completeMfa} onCancel={signOut} />
      </ConsumerAuthPanel>
    );
  }

  if (!principalLoading && session && principalType) {
    return <Navigate to={resolvePostAuthPath(principalType, from)} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setIsSigningIn(true);
    try {
      await consumerAuthService.signIn(values, turnstile.ensureToken());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSigningIn(false);
    }
  });

  return (
    <ConsumerAuthPanel
      title="Boas vindas de volta"
      description="Entre para consultar veículos, baixar relatórios e comprar com mais segurança."
      cta={
        <Link
          to={ROUTES.consultaRegister}
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
                Novo por aqui?
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-foreground">
                Criar conta grátis
                <ArrowRight
                  className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted-foreground">
                Cadastro em um minuto. Você só paga ao gerar o relatório.
              </p>
            </div>
          </div>
        </Link>
      }
      footer={
        <Link
          to={ROUTES.vistoriaLogin}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[rgb(16_21_28_/_0.08)] bg-white/60 px-4 py-3.5 text-center text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/25 hover:text-foreground"
        >
          É vistoriador?
          <span className="font-semibold text-primary">Acesse a Torres Vistoria</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate data-testid="consulta-login-form">
        <EmailField
          id="email"
          placeholder="seu@email.com"
          autoFocus
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="password"
          error={errors.password?.message}
          labelAction={
            <Link
              to={ROUTES.consultaForgotPassword}
              className="text-xs font-semibold tracking-wide text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          }
          {...register("password")}
        />

        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent px-0.5 py-1 text-[13px] leading-relaxed text-muted-foreground transition-colors hover:text-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
            {...register("acceptTerms")}
          />
          <span>
            Concordo com os{" "}
            <Link
              to={ROUTES.termos}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Termos
            </Link>{" "}
            e a{" "}
            <Link
              to={ROUTES.privacy}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Privacidade
            </Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}

        {error && <FormError message={error} />}

        {turnstile.field}

        <Button
          type="submit"
          className="mt-1 h-12 w-full text-[15px] tracking-wide shadow-glow"
          size="lg"
          disabled={isSubmitting}
        >
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
              Entrar na conta
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </Button>
      </form>
    </ConsumerAuthPanel>
  );
}
