import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { consumerAuthService } from "@/modules/torres-consulta/auth/consumer-auth-service";
import {
  consumerForgotPasswordSchema,
  type ConsumerForgotPasswordInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

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
      const redirectTo = `${window.location.origin}${ROUTES.clienteResetPassword}`;
      await consumerAuthService.resetPassword(values, redirectTo);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar e-mail");
    }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>
            {sent
              ? "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
              : "Informe seu e-mail para receber o link de recuperação."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" className="pl-11" {...register("email")} />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Enviar link
              </Button>
            </form>
          ) : (
            <Button asChild className="w-full">
              <Link to={ROUTES.clienteLogin}>Voltar ao login</Link>
            </Button>
          )}
          <Button variant="ghost" className="mt-4 w-full" asChild>
            <Link to={ROUTES.clienteLogin}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
