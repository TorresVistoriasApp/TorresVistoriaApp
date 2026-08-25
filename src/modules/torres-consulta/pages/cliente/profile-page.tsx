import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, Save, Shield, Trash2, User } from "lucide-react";
import { useSession } from "@/core/auth/session-context";
import { useAuth } from "@/core/auth/use-auth";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { ConsumerAccountStatus } from "@/core/auth/types";
import { cacheKeys } from "@/core/cache";
import { getErrorMessage } from "@/core/errors/app-error";
import {
  consumerProfileSchema,
  type ConsumerProfileInput,
} from "@/core/auth/schemas/consumer-auth";
import { ConsumerAccountPrivacySection } from "@/modules/torres-consulta/components/consumer-app/consumer-account-privacy-section";
import { ConsumerChangePasswordSection } from "@/modules/torres-consulta/components/consumer-app/consumer-change-password-section";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { UserAvatar } from "@/shared/components/user-avatar";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsFormActions,
  SettingsSection,
} from "@/shared/components/settings/settings-section";

export function ClienteProfilePage() {
  const { user } = useSession();
  const { signOut } = useAuth();
  const { resolution, refreshIdentity } = usePrincipal();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const consumerProfile =
    resolution.status === "resolved" && resolution.principalType === PrincipalType.CUSTOMER
      ? resolution.consumerProfile
      : null;

  const isInactive =
    consumerProfile?.account_status === ConsumerAccountStatus.PENDING_DELETION;
  const displayName = consumerProfile?.full_name ?? "Cliente";
  const email = user?.email ?? consumerProfile?.email ?? "";

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
    if (!consumerProfile || isInactive) return;

    try {
      await consumerProfileService.updateSelf(consumerProfile.id, {
        fullName: data.name,
        phone: data.phone?.trim() ? data.phone.trim() : null,
      });
      void queryClient.invalidateQueries({
        queryKey: cacheKeys.consumer.profile(consumerProfile.id),
      });
      void refreshIdentity();
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

  const handleAccountChanged = () => {
    void refreshIdentity();
    if (consumerProfile) {
      void queryClient.invalidateQueries({
        queryKey: cacheKeys.consumer.profile(consumerProfile.id),
      });
    }
  };

  return (
    <div className="min-w-0 space-y-6 pb-6">
      <ConsumerPageHeader
        title="Minha conta"
        subtitle={
          isInactive
            ? "Sua conta está inativa. Reative abaixo para voltar a usar a Torres Consulta."
            : "Gerencie suas informações pessoais e preferências."
        }
        badge={isInactive ? "Inativa" : undefined}
      />

      {isInactive && consumerProfile && (
        <SettingsSection
          icon={Trash2}
          title="Conta programada para exclusão"
          description="Você ainda pode recuperar sua conta dentro do prazo de 90 dias."
          className="border-warning-border"
        >
          <ConsumerAccountPrivacySection
            profile={consumerProfile}
            onAccountChanged={handleAccountChanged}
          />
        </SettingsSection>
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:items-start xl:gap-6">
        <aside className="min-w-0 xl:sticky xl:top-24">
          <div className="ui-panel overflow-hidden">
            <div className="border-b border-border px-5 py-6 text-center">
              <UserAvatar name={displayName} size="xl" className="mx-auto h-24 w-24 text-2xl" />
              <p className="mt-4 truncate text-lg font-bold text-foreground">{displayName}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
              {!isInactive ? (
                <span className="ui-chip-positive mt-3 inline-flex">Conta ativa</span>
              ) : (
                <span className="ui-chip-warning mt-3 inline-flex">Conta inativa</span>
              )}
            </div>

            <div className="p-4">
              <Button
                variant="outline"
                className="w-full border-destructive-border text-destructive hover:bg-destructive-subtle hover:text-destructive"
                onClick={() => void signOut()}
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </Button>
            </div>
          </div>
        </aside>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch">
          <SettingsSection
            icon={User}
            title="Dados pessoais"
            description="Informações da sua conta de consumidor."
            className="min-w-0 lg:col-span-2"
            fillHeight
          >
            <form onSubmit={onSubmit} className="flex h-full flex-col">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name" className={SETTINGS_FIELD_LABEL_CLASS}>
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-11"
                      disabled={isInactive}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-display" className={SETTINGS_FIELD_LABEL_CLASS}>
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email-display"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted pl-11"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado neste momento.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className={SETTINGS_FIELD_LABEL_CLASS}>
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    disabled={isInactive}
                    {...register("phone")}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <SettingsFormActions>
                <Button type="submit" disabled={isSubmitting || !consumerProfile || isInactive}>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </Button>
              </SettingsFormActions>
            </form>
          </SettingsSection>

          <SettingsSection
            icon={Shield}
            title="Segurança"
            description="Altere sua senha de acesso."
            className="min-w-0 h-full"
            fillHeight
          >
            {isInactive ? (
              <p className="text-sm text-muted-foreground">
                Reative sua conta para alterar a senha.
              </p>
            ) : (
              <ConsumerChangePasswordSection />
            )}
          </SettingsSection>

          {!isInactive && consumerProfile && (
            <SettingsSection
              icon={Trash2}
              title="Privacidade e LGPD"
              description="Exclusão de conta com prazo de recuperação de 90 dias."
              className="min-w-0 h-full"
              fillHeight
            >
              <ConsumerAccountPrivacySection
                profile={consumerProfile}
                onAccountChanged={handleAccountChanged}
              />
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
