import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCompletePasswordChange } from "@/hooks/use-auth";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";
import { ROUTES } from "@/lib/constants";
import { BrandLogo } from "@/components/shared/brand-logo";
import { PasswordStrengthInput } from "@/components/shared/password-strength-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/shared/loading-spinner";

export function Page() {
  const { session, profile, loading, refreshProfile } = useAuth();
  const completePasswordChange = useCompletePasswordChange();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to={ROUTES.login} replace />;
  if (profile && !profile.must_change_password) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await completePasswordChange.mutateAsync(values);
      await refreshProfile();
      window.location.assign(ROUTES.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha");
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f6f7f9] px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <BrandLogo size="md" />
        </div>

        <Card className="border-white/90 bg-white/95 shadow-elevated">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Trocar senha</CardTitle>
                <CardDescription className="mt-2">
                  Por segurança, defina uma nova senha antes de continuar usando o painel.
                </CardDescription>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <PasswordStrengthInput
                    id="change-password"
                    label="Nova senha"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.password?.message}
                  />
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="change-password-confirm">Confirmar nova senha</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="change-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    className="h-12 pl-11"
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
