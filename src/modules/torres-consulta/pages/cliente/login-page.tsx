import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordField } from "@/core/auth/components/password-field";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerLoginSchema,
  type ConsumerLoginInput,
} from "@/core/auth/schemas/consumer-auth";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { ConsumerAuthPanel } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-panel";

export function ClienteLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerLoginInput>({
    resolver: zodResolver(consumerLoginSchema),
    defaultValues: { acceptTerms: false },
  });

  if (sessionLoading || isSigningIn) {
    return (
      <div className="flex justify-center py-8 lg:col-start-2 lg:row-start-2">
        <LoadingSpinner label={isSigningIn ? "Entrando..." : "Carregando..."} />
      </div>
    );
  }

  if (!principalLoading && session && principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={from ?? ROUTES.consultaApp} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setIsSigningIn(true);
    try {
      await consumerAuthService.signIn(values);
      navigate(from ?? ROUTES.consultaApp, { replace: true });
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
      title="Entrar na Torres Consulta"
      meta="Conta de cliente"
      trust={["Dados protegidos", "Conforme LGPD", "Relatório na hora"]}
      cta={
        <Link
          to={ROUTES.consultaRegister}
          className="group flex items-center gap-3 rounded-xl border border-brand-border bg-brand-subtle p-3.5 transition-colors duration-150 hover:bg-brand-muted"
        >
          <span className="ui-icon-box h-10 w-10">
            <UserPlus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="ui-eyebrow">Novo por aqui?</span>
            <span className="mt-1 block text-sm font-bold text-foreground">Criar conta grátis</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              Cadastro em um minuto. Você só paga ao gerar o relatório.
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
          to={ROUTES.consultar}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3.5 text-center text-sm text-muted-foreground shadow-card transition-colors duration-150 hover:text-foreground"
        >
          Ainda não quer criar conta?
          <span className="font-semibold text-primary">Consultar veículo</span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3.5" noValidate data-testid="consulta-login-form">
        <EmailField
          id="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordField
          id="password"
          error={errors.password?.message}
          labelAction={
            <Link
              to={ROUTES.consultaForgotPassword}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          }
          {...register("password")}
        />

        <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
            {...register("acceptTerms")}
          />
          <span>
            Li e concordo com os{" "}
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
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}

        {error && <FormError message={error} />}

        <Button type="submit" className="h-11 w-full" size="lg" disabled={isSubmitting}>
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
    </ConsumerAuthPanel>
  );
}
