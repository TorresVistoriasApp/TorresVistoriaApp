import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { createUserSchema, type CreateUserInput } from "@/features/users/schemas/user-admin";
import { UserRole } from "@/lib/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthInput } from "@/components/shared/password-strength-input";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserInput) => Promise<void>;
}

export function CreateUserDialog({ open, onOpenChange, onSubmit }: CreateUserDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: UserRole.VISTORIADOR,
      password: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        email: "",
        fullName: "",
        role: UserRole.VISTORIADOR,
        password: "",
      });
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Cadastre uma conta com senha inicial. No primeiro acesso, será obrigatório definir uma nova senha.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (data) => {
            setSubmitError(null);
            setSubmitting(true);
            try {
              await onSubmit(data);
              onOpenChange(false);
            } catch (err) {
              setSubmitError(
                formatUserFacingError(err instanceof Error ? err.message : USER_MESSAGES.createFailed),
              );
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="create-user-name">Nome</Label>
            <Input id="create-user-name" className="touch-target" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input id="create-user-email" type="email" className="touch-target" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordStrengthInput
                id="create-user-password"
                label="Senha inicial"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="create-user-role">Papel</Label>
            <select
              id="create-user-role"
              className="flex h-11 w-full touch-target rounded-md border border-input bg-background px-3 text-sm"
              {...register("role")}
            >
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              <option value={UserRole.VISTORIADOR}>Vistoriador</option>
            </select>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          {submitError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar usuário"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
