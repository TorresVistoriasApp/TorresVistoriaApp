import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, LogIn } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordField } from "@/core/auth/components/password-field";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerLoginSchema,
  type ConsumerLoginInput,
} from "@/core/auth/schemas/consumer-auth";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";

export function ClienteLoginPage() {
  const location = useLocation();
  const { principalType, loading } = usePrincipal();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerLoginInput>({
    resolver: zodResolver(consumerLoginSchema),
    defaultValues: { acceptTerms: false },
  });

  if (loading) return <LoadingScreen />;
  if (principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={from ?? ROUTES.consultaApp} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consumerAuthService.signIn(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar. Verifique os dados e tente novamente.");
    }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Entrar</CardTitle>
          <CardDescription>Acesse sua conta Torres Consulta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <EmailField error={errors.email?.message} {...register("email")} />
            <PasswordField error={errors.password?.message} {...register("password")} />

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded" {...register("acceptTerms")} />
              <span>
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

            <Button type="submit" className="w-full touch-target" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link
                to={ROUTES.consultaForgotPassword}
                className="font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Novo por aqui?{" "}
              <Link
                to={ROUTES.consultaRegister}
                className="font-semibold text-primary hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
