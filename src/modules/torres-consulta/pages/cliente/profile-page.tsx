import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, Save, Shield, User } from "lucide-react";
import { useSession } from "@/core/auth/session-context";
import { useAuth } from "@/core/auth/use-auth";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { cacheKeys } from "@/core/cache";
import { getErrorMessage } from "@/core/errors/app-error";
import {
  consumerProfileSchema,
  type ConsumerProfileInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import {
  ConsumerSurface,
  ConsumerSurfaceHeader,
} from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { UserAvatar } from "@/shared/components/user-avatar";

export function ClienteProfilePage() {
  const { user } = useSession();
  const { signOut } = useAuth();
  const { resolution } = usePrincipal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const consumerProfile =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile
      : null;

  const displayName = consumerProfile?.full_name ?? "Cliente";

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
      <ConsumerPageHeader
        title="Minha conta"
        subtitle="Gerencie suas informações pessoais e preferências."
      />

      <ConsumerSurface>
        <div className="flex items-center gap-4 border-b border-border/40 pb-5">
          <UserAvatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email ?? consumerProfile?.email ?? ""}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <ConsumerSurfaceHeader
            title="Dados pessoais"
            description="Informações da sua conta de consumidor."
            icon={<User className="h-4 w-4" />}
          />

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" className="rounded-xl border-border/60 bg-muted/20 pl-11" {...register("name")} />
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
                  className="rounded-xl border-border/60 bg-muted/30 pl-11 opacity-80"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado neste momento.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                className="rounded-xl border-border/60 bg-muted/20"
                {...register("phone")}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !consumerProfile}
              className="rounded-full"
            >
              <Save className="h-4 w-4" />
              Salvar alterações
            </Button>
          </div>
        </form>
      </ConsumerSurface>

      <ConsumerSurface>
        <ConsumerSurfaceHeader
          title="Segurança"
          description="Alteração de senha disponível em breve."
          icon={<Shield className="h-4 w-4" />}
        />
        <div className="pt-4">
          <Button variant="outline" disabled className="rounded-full">
            Alterar senha
          </Button>
        </div>
      </ConsumerSurface>

      <ConsumerSurface className="border-destructive/10">
        <ConsumerSurfaceHeader
          title="Sessão"
          description="Encerre sua sessão neste dispositivo."
        />
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full rounded-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </div>
      </ConsumerSurface>
    </div>
  );
}
