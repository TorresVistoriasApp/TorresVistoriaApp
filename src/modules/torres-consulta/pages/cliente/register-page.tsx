import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Mail, User, UserPlus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/modules/torres-consulta/auth/consumer-auth-service";
import {
  consumerRegisterSchema,
  type ConsumerRegisterInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { LoadingScreen } from "@/shared/components/loading-spinner";

export function ClienteRegisterPage() {
  const { session, loading } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerRegisterInput>({
    resolver: zodResolver(consumerRegisterSchema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
      consentDataProcessing: false,
    },
  });

  const password = watch("password");

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={ROUTES.clienteDashboard} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consumerAuthService.signUp(values);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar conta");
    }
  });

  if (success) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de confirmação. Após verificar, você poderá acessar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to={ROUTES.clienteLogin}>Ir para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>Cadastro gratuito para acessar seus relatórios veiculares.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="pl-11" {...register("name")} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="email" className="pl-11" {...register("email")} />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" type="tel" placeholder="(00) 00000-0000" {...register("phone")} />
            </div>

            <PasswordStrengthInput
              id="password"
              label="Senha"
              value={password}
              onChange={(v) => setValue("password", v, { shouldValidate: true })}
              error={errors.password?.message}
            />

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded" {...register("acceptTerms")} />
                <span>
                  Aceito os{" "}
                  <Link to={ROUTES.termos} className="font-semibold text-primary hover:underline">
                    Termos de Uso
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
              )}

              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded" {...register("acceptPrivacy")} />
                <span>
                  Aceito a{" "}
                  <Link to={ROUTES.privacy} className="font-semibold text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              {errors.acceptPrivacy && (
                <p className="text-sm text-destructive">{errors.acceptPrivacy.message}</p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded"
                  {...register("consentDataProcessing")}
                />
                <span>Consinto com o tratamento dos meus dados pessoais conforme a LGPD.</span>
              </label>
              {errors.consentDataProcessing && (
                <p className="text-sm text-destructive">{errors.consentDataProcessing.message}</p>
              )}
            </div>

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
                  <UserPlus className="h-4 w-4" />
                  Criar conta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link to={ROUTES.clienteLogin} className="font-semibold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
