import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAuthRedirectUrl } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { EmailField } from "@/core/auth/components/email-field";
import { FormError } from "@/core/auth/components/form-error";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerForgotPasswordSchema,
  type ConsumerForgotPasswordInput,
} from "@/core/auth/schemas/consumer-auth";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function ClienteForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerForgotPasswordInput>({
    resolver: zodResolver(consumerForgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const redirectTo = getAuthRedirectUrl(ROUTES.consultaResetPassword);
      await consumerAuthService.resetPassword(values, redirectTo);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar o e-mail de recuperação.",
      );
    }
  });

  return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Esqueci minha senha</CardTitle>
          <CardDescription>
            {sent
              ? "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
              : "Informe seu e-mail para receber o link de recuperação."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <EmailField error={errors.email?.message} {...register("email")} />
              {error && <FormError message={error} />}
              <Button type="submit" className="w-full touch-target" disabled={isSubmitting}>
                Enviar link
              </Button>
            </form>
          ) : (
            <Button asChild className="w-full touch-target">
              <Link to={ROUTES.consultaLogin}>Voltar ao login</Link>
            </Button>
          )}
          <Button variant="ghost" className="mt-4 w-full touch-target" asChild>
            <Link to={ROUTES.consultaLogin}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </CardContent>
      </Card>
  );
}
