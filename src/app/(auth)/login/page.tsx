import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { checkRateLimit, formatRetryAfter, resetRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/shared/loading-spinner";
import { ROUTES } from "@/lib/constants";

export function Page() {
  const { signIn, session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

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
    <div className="relative flex min-h-dvh overflow-hidden bg-[#f6f7f9] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(234_88_12_/_0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgb(15_23_42_/_0.08),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(15_23_42_/_0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42_/_0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />

      <div className="pointer-events-none absolute left-8 top-32 hidden h-80 w-64 overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 shadow-elevated opacity-75 blur-[0.2px] md:block lg:left-12 lg:top-32 lg:h-[26rem] lg:w-80 xl:left-16 xl:top-36 xl:h-[30rem] xl:w-[22rem]">
        <img
          src={PUBLIC_IMAGES.auth.loginShowcase[1]}
          alt=""
          className="h-full w-full object-cover object-[center_35%] grayscale-[10%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-white/10 to-white/35" />
      </div>

      <div className="pointer-events-none absolute bottom-8 right-8 hidden h-72 w-96 overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 shadow-elevated opacity-70 md:block lg:bottom-10 lg:right-10 lg:h-80 lg:w-[30rem] xl:bottom-14 xl:right-16 xl:h-96 xl:w-[34rem]">
        <img
          src={PUBLIC_IMAGES.auth.loginShowcase[3]}
          alt=""
          className="h-full w-full object-cover object-[center_40%] grayscale-[8%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-white/15 to-slate-950/25" />
      </div>

      <div className="relative z-10 flex w-full flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
          <BrandLogo size="lg" className="hidden lg:flex" />
          <BrandLogo size="md" className="lg:hidden" />
          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 shadow-soft backdrop-blur-xl sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Acesso seguro
          </div>
        </header>

        <div className="relative h-28 overflow-hidden sm:h-32 md:hidden">
          <img
            src={PUBLIC_IMAGES.auth.loginBanner}
            alt=""
            className="h-full w-full object-cover object-[center_35%]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/55 to-[#f6f7f9]" />
        </div>

        <main className="flex flex-1 items-center justify-center px-4 pb-8 pt-3 sm:px-6 lg:pb-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-7 text-center">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                Torres Vistorias
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Entre no painel profissional
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
                Gestão cautelar com laudos, fotos, checklist e financeiro em uma experiência segura e
                elegante.
              </p>
            </div>

            <Card className="relative border-white/90 bg-white/90 shadow-[0_24px_90px_rgb(15_23_42_/_0.13)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
              <CardHeader className="space-y-2 border-b-border/40 pb-5 text-center sm:text-left">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl tracking-[-0.025em]">Autenticação</CardTitle>
                    <CardDescription className="mt-2 text-sm">
                      Use suas credenciais para acessar a operação.
                    </CardDescription>
                  </div>
                  <div className="hidden rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary sm:block">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <form onSubmit={onSubmit} className="space-y-5" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu@email.com"
                        className="h-12 border-slate-200 bg-slate-50 pl-11 shadow-none focus-visible:bg-white"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-12 border-slate-200 bg-slate-50 pl-11 pr-11 shadow-none focus-visible:bg-white"
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
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl shadow-[0_18px_42px_rgb(234_88_12_/_0.28)]"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Entrar no painel
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    <Link
                      to={ROUTES.forgotPassword}
                      className="font-semibold text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                    {" · "}
                    <Link to={ROUTES.privacy} className="font-semibold text-primary hover:underline">
                      Privacidade
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
