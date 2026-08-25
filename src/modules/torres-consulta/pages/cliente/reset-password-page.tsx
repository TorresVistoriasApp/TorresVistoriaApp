import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ConfirmPasswordField } from "@/core/auth/components/confirm-password-field";
import { FormError } from "@/core/auth/components/form-error";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import {
  consumerResetPasswordSchema,
  type ConsumerResetPasswordInput,
} from "@/core/auth/schemas/consumer-auth";
import { Button } from "@/shared/ui/button";
import { ConsumerAuthPanel } from "@/modules/torres-consulta/components/consumer-app/consumer-auth-panel";

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
      navigate(ROUTES.consultaLogin, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível redefinir a senha. Tente novamente.",
      );
    }
  });

  return (
    <ConsumerAuthPanel
      title="Criar nova senha"
      meta="Torres Consulta"
      description="Escolha uma senha forte para proteger seus relatórios."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <PasswordStrengthInput
          id="password"
          label="Nova senha"
          value={password}
          onChange={(v) => setValue("password", v, { shouldValidate: true })}
          error={errors.password?.message}
        />
        <ConfirmPasswordField
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {error && <FormError message={error} />}
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </ConsumerAuthPanel>
  );
}
