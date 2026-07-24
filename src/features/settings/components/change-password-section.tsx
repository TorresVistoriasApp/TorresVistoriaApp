import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useUpdatePassword } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";
import { PasswordStrengthInput } from "@/components/shared/password-strength-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "@/features/settings/components/settings-section";

export function ChangePasswordSection({ className }: { className?: string }) {
  const updatePassword = useUpdatePassword();
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePassword.mutateAsync(values.password);
      reset({ password: "", confirmPassword: "" });
      toast("Senha atualizada com sucesso");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar senha";
      setFormError(message);
      toast(message);
    }
  });

  return (
    <SettingsSection
      icon={KeyRound}
      title="Senha de acesso"
      description="Defina uma senha forte para esta conta. A alteração vale na próxima autenticação."
      className={className}
      fillHeight
    >
      <form onSubmit={onSubmit} className="flex h-full flex-col space-y-5">
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            Use no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo.
          </p>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordStrengthInput
                id="settings-change-password"
                label="Nova senha"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-change-password-confirm">Confirmar nova senha</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="settings-change-password-confirm"
              type="password"
              autoComplete="new-password"
              className="touch-target pl-11"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {formError && (
          <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {formError}
          </p>
        )}

        <Button
          type="submit"
          variant="outline"
          className="touch-target mt-auto"
          disabled={isSubmitting || updatePassword.isPending}
        >
          {isSubmitting || updatePassword.isPending ? "Salvando..." : "Atualizar senha"}
        </Button>
      </form>
    </SettingsSection>
  );
}
