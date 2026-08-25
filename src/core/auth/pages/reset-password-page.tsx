import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/core/auth/auth-service";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { TenantAuthPanel } from "@/core/auth/components/tenant-auth-panel";
import { resetPasswordSchema, type ResetPasswordInput } from "@/core/auth/schemas/auth";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const password = watch("password");

  const onSubmit = handleSubmit(async ({ password: newPassword }) => {
    setError(null);
    try {
      await authService.updatePassword(newPassword);
      navigate(ROUTES.login, { replace: true, state: { message: "Senha atualizada. Faça login." } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha");
    }
  });

  return (
    <TenantAuthPanel title="Nova senha" description="Defina uma senha segura para sua conta.">
      <form onSubmit={onSubmit} className="space-y-4" data-testid="reset-password-form">
        <PasswordStrengthInput
          id="password"
          label="Nova senha"
          value={password}
          onChange={(v) => setValue("password", v, { shouldValidate: true })}
          error={errors.password?.message}
        />
        <ConfirmPasswordField error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        {error && <FormError message={error} />}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </form>
    </TenantAuthPanel>
  );
}
