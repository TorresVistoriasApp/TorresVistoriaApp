import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { LockKeyhole } from "lucide-react";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { consumerResetPasswordSchema, type ConsumerResetPasswordInput } from "@/core/auth/schemas/consumer-auth";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { getErrorMessage } from "@/core/errors/app-error";

export function ConsumerChangePasswordSection() {
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerResetPasswordInput>({
    resolver: zodResolver(consumerResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await consumerAuthService.updatePassword(values);
      reset({ password: "", confirmPassword: "" });
      toast({
        title: "Senha atualizada",
        description: "Use a nova senha na próxima vez que entrar.",
      });
    } catch (cause) {
      const message = getErrorMessage(cause);
      setFormError(message);
      toast({ type: "error", title: "Não foi possível alterar a senha", description: message });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col space-y-4">
      <p className="text-sm text-muted-foreground">
        Use no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.
      </p>

      <div className="space-y-4">
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordStrengthInput
              id="consumer-change-password"
              label="Nova senha"
              value={field.value}
              onChange={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="consumer-change-password-confirm">Confirmar nova senha</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="consumer-change-password-confirm"
              type="password"
              autoComplete="new-password"
              className="pl-11"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {formError && (
        <p className="rounded-lg border border-destructive-border bg-destructive-subtle px-3 py-2.5 text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button
        type="submit"
        variant="outline"
        className="mt-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : "Atualizar senha"}
      </Button>
    </form>
  );
}
