import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import { resolvePostAuthPath } from "@/routes/panel";

export function ClienteLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const postAuthPath = resolvePostAuthPath(principalType ?? PrincipalType.CUSTOMER, from);

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
      <div className="flex flex-1 justify-center py-12">
        <LoadingSpinner label={isSigningIn ? "Entrando..." : "Carregando..."} />
      </div>
    );
  }

  if (!principalLoading && session && principalType) {
    return <Navigate to={resolvePostAuthPath(principalType, from)} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setIsSigningIn(true);
    try {
      await consumerAuthService.signIn(values);
      navigate(postAuthPath, { replace: true });
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
      title="Bem-vindo de volta"
      meta="Conta de cliente"
      description="Entre para ver seus relatórios e fazer novas consultas."
      trust={["Dados protegidos", "Conforme LGPD", "Relatório na hora"]}
      cta={
        <div className="rounded-xl border border-[rgb(16_21_28_/_0.08)] bg-[#faf9f7] p-4">
          <p className="text-[12px] font-medium text-muted-foreground">Ainda não tem conta?</p>
          <Link
            to={ROUTES.consultaRegister}
            className="group mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            Criar conta grátis
            <ArrowRight
              className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Cadastro em um minuto · você só paga ao gerar o relatório
          </p>
        </div>
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
