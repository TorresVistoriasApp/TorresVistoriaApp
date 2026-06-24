import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { checkRateLimit, formatRetryAfter, resetRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { LoginShowcase } from "@/components/auth/login-showcase";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/shared/loading-spinner";
import { ROUTES, DEMO_USERS, IS_DEMO_MODE } from "@/lib/constants";

export function Page() {
  const { signIn, session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const loginAs = async (email: string, password: string) => {
    setError(null);
    setValue("email", email);
    setValue("password", password);
    try {
      await signIn(email, password);
      resetRateLimit("login");
    } catch (err) {
      logger.warn("Falha no login demo");
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  };

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={ROUTES.dashboard} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    const limit = checkRateLimit("login", 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      setError(`Muitas tentativas. Tente novamente em ${formatRetryAfter(limit.retryAfterMs)}.`);
      return;
    }
    try {
      await signIn(values.email, values.password);
      resetRateLimit("login");
    } catch (err) {
      logger.warn("Falha no login");
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  });

  return (
    <div className="flex min-h-dvh bg-canvas">
      <LoginShowcase />

      <div className="relative flex flex-1 flex-col">
        <div className="relative h-44 overflow-hidden lg:hidden">
          <img
            src={PUBLIC_IMAGES.auth.loginBanner}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 to-canvas" />
          <div className="absolute bottom-4 left-4 rounded-2xl bg-white px-4 py-3 shadow-elevated">
            <BrandLogo size="sm" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 hidden lg:block">
              <BrandLogo size="md" showTagline />
            </div>

            <Card className="border-border/60 shadow-elevated">
              <CardHeader className="space-y-1 pb-2">
                <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                <CardDescription>Acesse sua conta para continuar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="touch-target pr-11"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Alternar visibilidade"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  {error && (
                    <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full touch-target" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Entrar
                      </>
                    )}
                  </Button>
                  {IS_DEMO_MODE && (
                    <div className="space-y-2 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                      <p className="text-center text-xs font-medium text-muted-foreground">
                        Acesso demo — senha: TorresDemo2026!
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isSubmitting}
                        onClick={() =>
                          void loginAs(DEMO_USERS.superAdmin.email, DEMO_USERS.superAdmin.password)
                        }
                      >
                        {DEMO_USERS.superAdmin.label}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isSubmitting}
                        onClick={() =>
                          void loginAs(DEMO_USERS.vistoriador.email, DEMO_USERS.vistoriador.password)
                        }
                      >
                        {DEMO_USERS.vistoriador.label}
                      </Button>
                    </div>
                  )}
                  <p className="text-center text-sm text-muted-foreground">
                    <Link
                      to={ROUTES.forgotPassword}
                      className="font-semibold text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                    {" · "}
                    <Link to="/privacidade" className="font-semibold text-primary hover:underline">
                      Privacidade
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
