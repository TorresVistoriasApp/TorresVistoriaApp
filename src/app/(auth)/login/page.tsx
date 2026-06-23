import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/shared/loading-spinner";
import { ROUTES, DEMO_USERS, IS_DEMO_MODE } from "@/lib/constants";

export function Page() {
  const { signIn, session, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  };

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={ROUTES.dashboard} replace />;

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await signIn(values.email, values.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Torres Vistoria</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
            {IS_DEMO_MODE && (
              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Acesso demo — senha: TorresDemo2026!
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => void loginAs(DEMO_USERS.superAdmin.email, DEMO_USERS.superAdmin.password)}
                >
                  {DEMO_USERS.superAdmin.label}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={() => void loginAs(DEMO_USERS.vistoriador.email, DEMO_USERS.vistoriador.password)}
                >
                  {DEMO_USERS.vistoriador.label}
                </Button>
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground">
              <Link to={ROUTES.forgotPassword} className="text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
