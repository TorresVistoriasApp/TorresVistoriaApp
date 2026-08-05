import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { onboardCompanySchema, type OnboardCompanyInput } from "@/modules/admin/platform/schemas/platform-admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { PasswordStrengthInput } from "@/core/auth/components/password-strength-input";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";

interface OnboardCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OnboardCompanyInput) => Promise<void>;
}

const DEFAULT_VALUES: OnboardCompanyInput = {
  tradeName: "",
  legalName: "",
  document: "",
  companyEmail: "",
  companyPhone: "",
  subscriptionPlan: "starter",
  adminFullName: "",
  adminEmail: "",
  adminPassword: "",
};

export function OnboardCompanyDialog({ open, onOpenChange, onSubmit }: OnboardCompanyDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardCompanyInput>({
    resolver: zodResolver(onboardCompanySchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      reset(DEFAULT_VALUES);
      setSubmitError(null);
      setSubmitting(false);
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>
            Cria o tenant e o primeiro usuário Super Admin, já isolados de todas as demais
            empresas via RLS.
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
                formatUserFacingError(
                  err instanceof Error ? err.message : "Não foi possível criar a empresa.",
                ),
              );
            } finally {
              setSubmitting(false);
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="onboard-trade-name">Nome fantasia</Label>
            <Input id="onboard-trade-name" className="touch-target" {...register("tradeName")} />
            {errors.tradeName && (
              <p className="text-sm text-destructive">{errors.tradeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-legal-name">Razão social</Label>
            <Input id="onboard-legal-name" className="touch-target" {...register("legalName")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-plan">Plano</Label>
            <select
              id="onboard-plan"
              className="flex h-11 w-full touch-target rounded-md border border-input bg-background px-3 text-sm"
              {...register("subscriptionPlan")}
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="border-t border-border/60 pt-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Primeiro administrador da empresa
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="onboard-admin-name">Nome</Label>
                <Input
                  id="onboard-admin-name"
                  className="touch-target"
                  {...register("adminFullName")}
                />
                {errors.adminFullName && (
                  <p className="text-sm text-destructive">{errors.adminFullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="onboard-admin-email">Email</Label>
                <Input
                  id="onboard-admin-email"
                  type="email"
                  className="touch-target"
                  {...register("adminEmail")}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                )}
              </div>

              <Controller
                control={control}
                name="adminPassword"
                render={({ field }) => (
                  <PasswordStrengthInput
                    id="onboard-admin-password"
                    label="Senha inicial"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.adminPassword?.message}
                  />
                )}
              />
            </div>
          </div>

          {submitError && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar empresa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
