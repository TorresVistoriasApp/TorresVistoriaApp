import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Save, User } from "lucide-react";
import { useSession } from "@/core/auth/session-context";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { cacheKeys } from "@/core/cache";
import { getErrorMessage } from "@/core/errors/app-error";
import {
  consumerProfileSchema,
  type ConsumerProfileInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export function ClienteProfilePage() {
  const { user } = useSession();
  const { resolution } = usePrincipal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const consumerProfile =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile
      : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerProfileInput>({
    resolver: zodResolver(consumerProfileSchema),
    defaultValues: {
      name: consumerProfile?.full_name ?? "",
      phone: consumerProfile?.phone ?? "",
    },
  });

  useEffect(() => {
    if (consumerProfile) {
      reset({
        name: consumerProfile.full_name,
        phone: consumerProfile.phone ?? "",
      });
    }
  }, [consumerProfile, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!consumerProfile) return;

    try {
      await consumerProfileService.updateSelf(consumerProfile.id, {
        fullName: data.name,
        phone: data.phone?.trim() ? data.phone.trim() : null,
      });
      void queryClient.invalidateQueries({
        queryKey: cacheKeys.consumer.profile(consumerProfile.id),
      });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (cause) {
      toast({
        type: "error",
        title: "Não foi possível salvar",
        description: getErrorMessage(cause),
      });
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Meu Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie suas informações pessoais e preferências.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados pessoais</CardTitle>
          <CardDescription>Informações da sua conta de consumidor.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="pl-11" {...register("name")} />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-display">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email-display"
                  type="email"
                  value={user?.email ?? consumerProfile?.email ?? ""}
                  disabled
                  className="pl-11 opacity-70"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado neste momento.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(00) 00000-0000" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting || !consumerProfile}>
              <Save className="h-4 w-4" />
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Segurança</CardTitle>
          <CardDescription>Alteração de senha disponível em breve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            Alterar senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
