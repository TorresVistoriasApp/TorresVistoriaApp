import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Building2, Camera, MapPin, Save, UserRound } from "lucide-react";
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
  SettingsNotice,
  SettingsSection,
} from "@/features/settings/components/settings-section";

function ProfileSection({
  form,
  profileId,
  fullName,
  avatarUrl,
  className,
  fillHeight = false,
}: {
  form: UseFormReturn<UserProfileInput>;
  profileId?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fillHeight?: boolean;
}) {
  const { refreshProfile } = useAuth();
  const uploadAvatar = useUploadUserAvatar();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      className={className}
      fillHeight={fillHeight}
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
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
      </div>
    </SettingsSection>
  );
}

function CompanySection({
  form,
  canEdit,
  isLoading,
  dataSectionClassName,
  addressSectionClassName,
  loadingClassName,
  fillHeight = false,
  onCepError,
}: {
  form: UseFormReturn<CompanyInput>;
  canEdit: boolean;
  isLoading: boolean;
  dataSectionClassName?: string;
  addressSectionClassName?: string;
  loadingClassName?: string;
  fillHeight?: boolean;
  onCepError: (message: string) => void;
}) {
  if (isLoading) {
    return (
      <div className={loadingClassName}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <SettingsSection
        icon={Building2}
        title="Seus dados"
        description="Identificação cadastral exibida nos laudos e documentos emitidos pelo sistema."
        className={dataSectionClassName}
        fillHeight={fillHeight}
      >
        <div className="space-y-4">
          <div className="grid min-w-0 gap-4">
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
        className={addressSectionClassName}
        fillHeight={fillHeight}
      >
        <CompanyAddressFields
          control={form.control}
          register={form.register}
          setValue={form.setValue}
          canEdit={canEdit}
          onCepError={onCepError}
        />
      </SettingsSection>
    </>
  );
}

function SaveSettingsButton({
  isSaving,
  disabled,
  onClick,
  className,
}: {
  isSaving: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      className={className}
      disabled={disabled || isSaving}
      onClick={onClick}
    >
      <Save className="h-4 w-4" />
      {isSaving ? "Salvando..." : "Salvar"}
    </Button>
  );
}

export function Page() {
  const { profile, refreshProfile } = useAuth();
  const isAdmin = profile?.role === UserRole.SUPER_ADMIN;
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const updateProfile = useUpdateUserProfile();
  const updateCompany = useUpdateCompany();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const profileForm = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    values: {
      full_name: profile?.full_name ?? "",
      phone: "",
      avatar_url: profile?.avatar_url ?? "",
    },
  });

  const companyForm = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    values: company
      ? {
          name: company.name,
          document: company.document ? maskCpfCnpj(company.document) : "",
          ...companyToAddressInput(company),
        }
      : undefined,
  });

  const handleSave = async () => {
    if (!profile?.id) return;

    const profileValid = await profileForm.trigger();
    const companyValid = isAdmin ? await companyForm.trigger() : true;

    if (!profileValid || !companyValid) {
      toast("Verifique os campos destacados antes de salvar.");
      return;
    }

    setIsSaving(true);
    try {
      const tasks: Promise<unknown>[] = [
        updateProfile.mutateAsync({
          profileId: profile.id,
          input: profileForm.getValues(),
        }),
      ];

      if (isAdmin) {
        tasks.push(updateCompany.mutateAsync(companyForm.getValues()));
      }

      await Promise.all(tasks);
      await refreshProfile();
      toast("Configurações salvas com sucesso");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  const saveDisabled = !profile?.id || (isAdmin && isCompanyLoading);

  return (
    <div className="min-w-0 space-y-6 pb-24 sm:pb-6">
      <PageHeader
        title="Configurações"
        description="Gerencie perfil, identificação cadastral, endereço e parâmetros operacionais da conta."
        actions={
          <SaveSettingsButton
            isSaving={isSaving}
            disabled={saveDisabled}
            onClick={() => void handleSave()}
            className="touch-target hidden w-full sm:inline-flex sm:w-auto"
          />
        }
      />

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] xl:items-stretch xl:gap-5">
        <ProfileSection
          form={profileForm}
          profileId={profile?.id}
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
          className="xl:col-start-1 xl:row-start-1 xl:h-full"
          fillHeight
        />
        <CompanySection
          form={companyForm}
          canEdit={isAdmin}
          isLoading={isCompanyLoading}
          dataSectionClassName="xl:col-start-2 xl:row-start-1 xl:h-full"
          addressSectionClassName="xl:col-start-2 xl:row-start-2 xl:h-full"
          loadingClassName="xl:col-start-2 xl:row-span-2"
          fillHeight
          onCepError={(message) => toast(message)}
        />
        <InspectionTypesSection
          canEdit={isAdmin}
          className="xl:col-start-1 xl:row-start-2 xl:h-full"
          fillHeight
        />
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-border/60 bg-card/95 px-4 py-3 shadow-elevated backdrop-blur-sm sm:hidden">
        <SaveSettingsButton
          isSaving={isSaving}
          disabled={saveDisabled}
          onClick={() => void handleSave()}
          className="touch-target w-full"
        />
      </div>
    </div>
  );
}
