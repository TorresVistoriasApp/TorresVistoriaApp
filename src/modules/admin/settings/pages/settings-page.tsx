import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { Building2, Camera, MapPin, Palette, Save, UserRound } from "lucide-react";
import { useAuth } from "@/core/auth/use-auth";
import { PageHeader } from "@/shared/components/page-header";
import { UserAvatar } from "@/shared/components/user-avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useTenant, useUpdateTenant } from "@/core/tenant";
import { useUpdateUserProfile, useUploadUserAvatar } from "@/modules/admin/users/hooks/use-users";
import { useToast } from "@/shared/hooks/use-toast";
import { userProfileSchema, type UserProfileInput } from "@/modules/admin/users/schemas/user";
import { companySchema, type CompanyInput } from "@/core/tenant/schemas/company";
import { usePermission } from "@/core/rbac/use-permission";
import { MaskedField } from "@/shared/components/forms/masked-fields";
import { FormField } from "@/shared/components/forms/form-field";
import { companyToAddressInput } from "@/core/tenant/company-address";
import { maskCpfCnpj } from "@/shared/lib/masks";
import { redactDocument } from "@/shared/lib/pii";
import { CompanyAddressFields } from "@/modules/admin/settings/components/company-address-fields";
import { InspectionTypesSection } from "@/modules/torres-vistoria";
import { PrivacyRightsSection } from "@/modules/admin/settings/components/privacy-rights-section";
import { ChangePasswordSection } from "@/modules/admin/settings/components/change-password-section";
import { MfaTotpSection } from "@/core/auth/components/mfa-totp-section";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsNotice,
  SettingsSection,
} from "@/shared/components/settings/settings-section";

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
              className="absolute -bottom-0.5 -right-0.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-soft transition-colors duration-150 hover:bg-primary-hover disabled:opacity-60 sm:h-9 sm:w-9"
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

          <div className="grid w-full min-w-0 flex-1 gap-4 sm:grid-cols-2">
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

            <FormField
              label="Telefone"
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              hint="Usado para contato interno. Opcional."
              error={form.formState.errors.phone?.message}
            >
              <Input
                id="profile-phone"
                className="touch-target"
                placeholder="Ex.: (11) 91234-5678"
                autoComplete="tel"
                {...form.register("phone")}
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
              label="Nome fantasia"
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              hint="Nome pelo qual a empresa é conhecida comercialmente."
              error={form.formState.errors.trade_name?.message}
              className="min-w-0"
            >
              <Input
                id="company-trade-name"
                className="touch-target"
                placeholder="Ex.: Torres Vistoria"
                autoComplete="organization"
                disabled={!canEdit}
                {...form.register("trade_name")}
              />
            </FormField>
            <FormField
              label="Razão social"
              labelClassName={SETTINGS_FIELD_LABEL_CLASS}
              hint="Opcional. Nome registrado no documento de constituição da empresa."
              error={form.formState.errors.legal_name?.message}
              className="min-w-0"
            >
              <Input
                id="company-legal-name"
                className="touch-target"
                placeholder="Ex.: Torres Vistoria Ltda."
                disabled={!canEdit}
                {...form.register("legal_name")}
              />
            </FormField>
            {canEdit ? (
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
              />
            ) : (
              <FormField
                label="CPF ou CNPJ"
                labelClassName={SETTINGS_FIELD_LABEL_CLASS}
                hint="Documento mascarado. O valor completo entra só no laudo em PDF."
                className="min-w-0"
              >
                <p className="flex min-h-10 items-center text-sm text-foreground">
                  {form.getValues("document") ? redactDocument(form.getValues("document")) : "—"}
                </p>
              </FormField>
            )}
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

function CompanyBrandColorsSection({
  form,
  canEdit,
  className,
  fillHeight = false,
}: {
  form: UseFormReturn<CompanyInput>;
  canEdit: boolean;
  className?: string;
  fillHeight?: boolean;
}) {
  return (
    <SettingsSection
      icon={Palette}
      title="Identidade visual"
      description="Cores utilizadas no branding do painel e nos laudos em PDF."
      className={className}
      fillHeight={fillHeight}
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <FormField
          label="Cor primária"
          labelClassName={SETTINGS_FIELD_LABEL_CLASS}
          error={form.formState.errors.primary_color?.message}
          className="min-w-0"
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input"
              disabled={!canEdit}
              {...form.register("primary_color")}
              aria-label="Selecionar cor primária"
            />
            <Input
              className="touch-target"
              placeholder="#1e40af"
              disabled={!canEdit}
              {...form.register("primary_color")}
            />
          </div>
        </FormField>
        <FormField
          label="Cor secundária"
          labelClassName={SETTINGS_FIELD_LABEL_CLASS}
          error={form.formState.errors.secondary_color?.message}
          className="min-w-0"
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input"
              disabled={!canEdit}
              {...form.register("secondary_color")}
              aria-label="Selecionar cor secundária"
            />
            <Input
              className="touch-target"
              placeholder="#0f172a"
              disabled={!canEdit}
              {...form.register("secondary_color")}
            />
          </div>
        </FormField>
      </div>
    </SettingsSection>
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

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { can } = usePermission();
  const isAdmin = can("settings.manage");
  const { data: company, isLoading: isCompanyLoading } = useTenant();
  const updateProfile = useUpdateUserProfile();
  const updateCompany = useUpdateTenant();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const profileForm = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    values: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      avatar_url: profile?.avatar_url ?? "",
    },
  });

  const companyForm = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    values: company
      ? {
          trade_name: company.trade_name,
          legal_name: company.legal_name ?? "",
          document: company.document ? maskCpfCnpj(company.document) : "",
          primary_color: company.primary_color,
          secondary_color: company.secondary_color,
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

      {isAdmin && (
        <CompanyBrandColorsSection form={companyForm} canEdit={isAdmin} className="min-w-0" />
      )}

      <div className="grid min-w-0 gap-5 lg:grid-cols-2 lg:items-stretch">
        <ChangePasswordSection className="min-w-0 h-full" />
        <MfaTotpSection className="min-w-0 h-full" />
      </div>

      <PrivacyRightsSection className="min-w-0" />

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-border bg-card px-4 py-3 shadow-elevated sm:hidden">
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
