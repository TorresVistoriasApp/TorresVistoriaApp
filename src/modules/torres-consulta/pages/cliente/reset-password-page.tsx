import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { consumerAuthService } from "@/modules/torres-consulta/auth/consumer-auth-service";
import {
  consumerResetPasswordSchema,
  type ConsumerResetPasswordInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function ClienteResetPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerResetPasswordInput>({
    resolver: zodResolver(consumerResetPasswordSchema),
  });

  const password = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consumerAuthService.updatePassword(values);
      navigate(ROUTES.clienteLogin, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao redefinir senha");
    }
  });

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Link to={ROUTES.consultaLanding} className="mb-8">
        <ConsultaBrandLogo size="lg" />
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Nova senha</CardTitle>
          <CardDescription>Defina uma nova senha para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <PasswordStrengthInput
              id="password"
              label="Nova senha"
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Redefinir senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
