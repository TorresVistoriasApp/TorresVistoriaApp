import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, Camera, MapPin, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useUpdateUserProfile, useUploadUserAvatar } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { userProfileSchema, type UserProfileInput } from "@/schemas/user";
import { companySchema, type CompanyInput } from "@/schemas/settings";
import { UserRole } from "@/lib/enums";
import { MaskedField } from "@/components/forms/masked-fields";
import { FormField } from "@/components/forms/form-field";
import { companyToAddressInput } from "@/lib/cep";
import { maskCpfCnpj } from "@/lib/masks";
import { CompanyAddressFields } from "@/features/settings/components/company-address-fields";
import { InspectionTypesSection } from "@/features/settings/components/inspection-types-section";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsFormActions,
  SettingsNotice,
  SettingsSection,
} from "@/features/settings/components/settings-section";

function ProfileSection({
  profileId,
  fullName,
  avatarUrl,
}: {
  profileId?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}) {
  const { refreshProfile } = useAuth();
  const updateProfile = useUpdateUserProfile();
  const uploadAvatar = useUploadUserAvatar();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    values: {
      full_name: fullName ?? "",
      phone: "",
      avatar_url: avatarUrl ?? "",
    },
  });

  const displayAvatar = previewUrl ?? avatarUrl;

  const handleAvatarChange = async (file: File) => {
    if (!profileId) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    try {
      const url = await uploadAvatar.mutateAsync({ userId: profileId, file });
      form.setValue("avatar_url", url);
      await refreshProfile();
      toast("Foto de perfil atualizada");
    } catch (err) {
      setPreviewUrl(null);
      toast(err instanceof Error ? err.message : "Erro ao enviar foto");
    }
  };

  return (
    <SettingsSection
      icon={UserRound}
      title="Perfil do usuário"
      description="Dados pessoais vinculados à sua conta de acesso no sistema."
    >
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (data) => {
          if (!profileId) return;
          try {
            await updateProfile.mutateAsync({ profileId, input: data });
            await refreshProfile();
            toast("Perfil atualizado com sucesso");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Erro ao salvar");
          }
        })}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <UserAvatar
              name={fullName}
              avatarUrl={displayAvatar}
              size="xl"
              className="h-24 w-24 text-2xl ring-2 ring-border/60 sm:h-20 sm:w-20 sm:text-xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute -bottom-0.5 -right-0.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-md transition hover:bg-primary/90 disabled:opacity-60 sm:h-9 sm:w-9"
              aria-label="Alterar foto de perfil"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleAvatarChange(file);
                event.target.value = "";
              }}
            />
          </div>

          <div className="w-full min-w-0 flex-1">
            <FormField
              label="Nome completo"
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              hint="Utilizado para identificação interna no painel administrativo."
              error={form.formState.errors.full_name?.message}
            >
              <Input
                id="profile-name"
                className="touch-target"
                placeholder="Ex.: João Silva"
                autoComplete="name"
                {...form.register("full_name")}
              />
            </FormField>
          </div>
        </div>

        <SettingsFormActions hint="Alterações do seu perfil pessoal de acesso.">
          <Button
            type="submit"
            className="touch-target w-full sm:w-auto"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Salvando..." : "Salvar perfil"}
          </Button>
        </SettingsFormActions>
      </form>
    </SettingsSection>
  );
}

function CompanySection({ canEdit }: { canEdit: boolean }) {
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();
  const { toast } = useToast();

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    values: company
      ? {
          name: company.name,
          document: company.document ? maskCpfCnpj(company.document) : "",
          ...companyToAddressInput(company),
        }
      : undefined,
  });

  if (isLoading) return <LoadingSpinner />;

  const onSubmit = form.handleSubmit(async (data) => {
    if (!canEdit) return;
    try {
      await updateCompany.mutateAsync(data);
      toast("Dados cadastrais atualizados com sucesso");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar");
    }
  });

  return (
    <form className="grid min-w-0 gap-6" onSubmit={onSubmit}>
      <SettingsSection
        icon={Building2}
        title="Seus dados"
        description="Identificação cadastral exibida nos laudos e documentos emitidos pelo sistema."
      >
        <div className="space-y-5">
          <div className="grid min-w-0 gap-5">
            <FormField
              label="Nome ou razão social"
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              hint="Informe conforme o documento de identificação ou registro empresarial."
              error={form.formState.errors.name?.message}
              className="min-w-0"
            >
              <Input
                id="company-name"
                className="touch-target"
                placeholder="Ex.: Torres Vistoria Ltda."
                autoComplete="organization"
                disabled={!canEdit}
                {...form.register("name")}
              />
            </FormField>
            <MaskedField
              control={form.control}
              name="document"
              label="CPF ou CNPJ"
              mask="cpfCnpj"
              placeholder="Digite o CPF ou CNPJ"
              hint="Campo opcional. Será impresso no laudo em PDF quando informado."
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              inputClassName="touch-target"
              className="min-w-0"
              error={form.formState.errors.document?.message}
              disabled={!canEdit}
            />
          </div>
          {!canEdit && (
            <SettingsNotice>
              Somente administradores podem editar os dados cadastrais da operação.
            </SettingsNotice>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={MapPin}
        title="Endereço"
        description="Localização cadastral utilizada nos laudos e demais comunicações oficiais."
      >
        <CompanyAddressFields
          control={form.control}
          register={form.register}
          setValue={form.setValue}
          canEdit={canEdit}
          onCepError={(message) => toast(message)}
        />

        {canEdit && (
          <SettingsFormActions hint="Salva em conjunto a identificação cadastral e o endereço informados acima.">
            <Button
              type="submit"
              className="touch-target w-full sm:w-auto"
              disabled={updateCompany.isPending}
            >
              {updateCompany.isPending ? "Salvando..." : "Salvar dados cadastrais"}
            </Button>
          </SettingsFormActions>
        )}
      </SettingsSection>
    </form>
  );
}

export function Page() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="min-w-0 space-y-8 pb-8">
      <PageHeader
        title="Configurações"
        description="Gerencie perfil, identificação cadastral, endereço e parâmetros operacionais da conta."
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-2 xl:items-start xl:gap-8">
        <ProfileSection
          profileId={profile?.id}
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />
        <CompanySection canEdit={isAdmin} />
      </div>

      <InspectionTypesSection canEdit={isAdmin} />
    </div>
  );
}
