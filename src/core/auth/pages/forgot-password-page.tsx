import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { checkRateLimit, formatRetryAfter } from "@/core/auth/rate-limit";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/core/auth/schemas/auth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ROUTES } from "@/config/routes";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setMessage(null);
    setError(null);

    const normalized = email.trim().toLowerCase();
    const perEmail = checkRateLimit(`reset:${normalized}`, 3, 15 * 60 * 1000);
    const global = checkRateLimit("reset:global", 20, 15 * 60 * 1000);
    if (!perEmail.allowed || !global.allowed) {
      const retry = Math.max(perEmail.retryAfterMs, global.retryAfterMs);
      setError(`Muitas tentativas. Tente novamente em ${formatRetryAfter(retry)}.`);
      return;
    }

    try {
      await resetPassword(email);
      // Mesma mensagem se o e-mail existir ou não — evita enumeração de contas.
      setMessage("Se o e-mail estiver cadastrado, enviaremos um link de recuperação.");
    } catch {
      setMessage("Se o e-mail estiver cadastrado, enviaremos um link de recuperação.");
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>Informe seu e-mail cadastrado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            {message && <p className="text-sm text-success">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Enviar link
            </Button>
            <p className="text-center text-sm">
              <Link to={ROUTES.login} className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
