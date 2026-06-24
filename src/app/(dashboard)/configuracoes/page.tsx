import { useRef, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, Camera, MapPin, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useUpdateUserProfile, useUploadUserAvatar } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { userProfileSchema, type UserProfileInput } from "@/schemas/user";
import { companySchema, type CompanyInput } from "@/schemas/settings";
import { UserRole } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { companyToAddressInput } from "@/lib/cep";
import { CompanyAddressFields } from "@/features/settings/components/company-address-fields";
import { InspectionTypesSection } from "@/features/settings/components/inspection-types-section";

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft",
        className,
      )}
    >
      <div className="border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

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
      title="Perfil"
      description="Sua identificação dentro do sistema Torres Vistorias"
    >
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (data) => {
          if (!profileId) return;
          try {
            await updateProfile.mutateAsync({ profileId, input: data });
            await refreshProfile();
            toast("Perfil atualizado");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Erro ao salvar");
          }
        })}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0 self-start">
            <UserAvatar name={fullName} avatarUrl={displayAvatar} size="xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-md transition hover:bg-primary/90 disabled:opacity-60"
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
          <div className="flex-1 space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input
              id="profile-name"
              className="touch-target"
              placeholder="Seu nome completo"
              {...form.register("full_name")}
            />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              A foto é exibida apenas no seu perfil dentro do painel.
            </p>
          </div>
        </div>
        <Button type="submit" className="touch-target" disabled={updateProfile.isPending}>
          Salvar perfil
        </Button>
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
          document: company.document ?? "",
          ...companyToAddressInput(company),
        }
      : undefined,
  });

  if (isLoading) return <LoadingSpinner />;

  const onSubmit = form.handleSubmit(async (data) => {
    if (!canEdit) return;
    try {
      await updateCompany.mutateAsync(data);
      toast("Dados da empresa atualizados");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar");
    }
  });

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <SettingsSection
        icon={Building2}
        title="Dados da empresa"
        description="Informações cadastrais da sua operação"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-document">CNPJ</Label>
              <Input
                id="company-document"
                placeholder="00.000.000/0000-00"
                disabled={!canEdit}
                {...form.register("document")}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company-name">Razão social</Label>
              <Input
                id="company-name"
                placeholder="Nome legal da empresa"
                disabled={!canEdit}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
          </div>
          {!canEdit && (
            <p className="text-xs text-muted-foreground">
              Apenas administradores podem alterar os dados da empresa.
            </p>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={MapPin}
        title="Endereço"
        description="Localização completa da sede da empresa"
      >
        <CompanyAddressFields
          control={form.control}
          register={form.register}
          setValue={form.setValue}
          canEdit={canEdit}
          onCepError={(message) => toast(message)}
        />
      </SettingsSection>

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" className="touch-target w-full sm:w-auto" disabled={updateCompany.isPending}>
            Salvar dados da empresa
          </Button>
        </div>
      )}
    </form>
  );
}

export function Page() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Configurações"
        description="Gerencie seu perfil e os dados da empresa em um só lugar"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)] lg:gap-8">
        <ProfileSection
          profileId={profile?.id}
          fullName={profile?.full_name}
          avatarUrl={profile?.avatar_url}
        />
        <CompanySection canEdit={isAdmin} />
        <InspectionTypesSection canEdit={isAdmin} />
      </div>
    </div>
  );
}
