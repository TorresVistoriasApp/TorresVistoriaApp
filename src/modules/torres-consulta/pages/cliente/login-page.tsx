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
      <div className="flex w-full max-w-[26rem] justify-center py-8">
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
      title="Entrar na sua conta"
      description="Acesse seus relatórios e consulte novos veículos."
      footer={
        <>
          Novo por aqui?{" "}
          <Link to={ROUTES.consultaRegister} className="font-semibold text-primary hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <EmailField error={errors.email?.message} {...register("email")} />

        <div>
          <PasswordField error={errors.password?.message} {...register("password")} />
          <div className="mt-2 flex justify-end">
            <Link
              to={ROUTES.consultaForgotPassword}
              className="text-sm font-medium text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/50 p-3.5 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
            {...register("acceptTerms")}
          />
          <span className="text-muted-foreground">
            Li e concordo com os{" "}
            <Link to={ROUTES.termos} className="font-semibold text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to={ROUTES.privacy} className="font-semibold text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}

        {error && <FormError message={error} />}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
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
