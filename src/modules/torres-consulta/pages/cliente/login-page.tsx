import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/modules/torres-consulta/auth/consumer-auth-service";
import {
  consumerLoginSchema,
  type ConsumerLoginInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingScreen } from "@/shared/components/loading-spinner";

export function ClienteLoginPage() {
  const { session, loading } = useSession();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
  if (session) return <Navigate to={from ?? ROUTES.clienteDashboard} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consumerAuthService.signIn(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Área do Cliente</CardTitle>
          <CardDescription>Entre com seu e-mail para acessar seus relatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-11"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pl-11 pr-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

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

            {error && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
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
                to={ROUTES.clienteForgotPassword}
                className="font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{" "}
              <Link
                to={ROUTES.clienteRegister}
                className="font-semibold text-primary hover:underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Sessão segura com Supabase Auth
      </p>
    </div>
  );
}
