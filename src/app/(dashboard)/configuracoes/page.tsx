import { Link, useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useCompany,
  useCompanySettings,
  useUpdateCompany,
  useUpdateCompanySettings,
  useUploadCompanyAsset,
} from "@/hooks/use-company";
import { useUpdateUserProfile } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { userProfileSchema, type UserProfileInput } from "@/schemas/user";
import { companySchema, settingsSchema, type CompanyInput, type SettingsInput } from "@/schemas/settings";
import { DEFAULT_PRIMARY_COLOR } from "@/lib/constants";
import { useExportMyData, useRequestAccountDeletion } from "@/hooks/use-lgpd";
import { lgpdService } from "@/services/lgpd-service";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useState } from "react";

export function Page() {
  const { profile, user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "perfil";
  const isAdmin = profile?.role === UserRole.SUPER_ADMIN;

  const setTab = (value: string) => {
    setParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Configurações</h1>
        {isAdmin && (
          <div className="flex gap-2 text-sm">
            <Button asChild variant="outline" size="sm" className="touch-target">
              <Link to="/configuracoes/usuarios">Usuários</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="touch-target">
              <Link to="/configuracoes/auditoria">Auditoria</Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="privacidade">Privacidade</TabsTrigger>
          {isAdmin && <TabsTrigger value="empresa">Empresa</TabsTrigger>}
          {isAdmin && <TabsTrigger value="tema">Tema</TabsTrigger>}
        </TabsList>

        <TabsContent value="perfil">
          <ProfileTab profileId={profile?.id} fullName={profile?.full_name} email={user?.email} />
        </TabsContent>

        <TabsContent value="privacidade">
          <PrivacyTab />
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="empresa">
              <RequireRole roles={[UserRole.SUPER_ADMIN]}>
                <CompanyTab />
              </RequireRole>
            </TabsContent>
            <TabsContent value="tema">
              <RequireRole roles={[UserRole.SUPER_ADMIN]}>
                <ThemeTab />
              </RequireRole>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function ProfileTab({
  profileId,
  fullName,
  email,
}: {
  profileId?: string;
  fullName?: string | null;
  email?: string | null;
}) {
  const updateProfile = useUpdateUserProfile();
  const { toast } = useToast();
  const form = useForm<UserProfileInput>({
    resolver: zodResolver(userProfileSchema),
    values: {
      full_name: fullName ?? "",
      phone: "",
      avatar_url: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            if (!profileId) return;
            try {
              await updateProfile.mutateAsync({ profileId, input: data });
              toast("Perfil atualizado");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Erro ao salvar");
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="profile-email">E-mail</Label>
            <Input id="profile-email" value={email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input id="profile-name" className="touch-target" {...form.register("full_name")} />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>
          <Button type="submit" className="touch-target" disabled={updateProfile.isPending}>
            Salvar perfil
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CompanyTab() {
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();
  const uploadAsset = useUploadCompanyAsset();
  const { toast } = useToast();

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    values: company
      ? {
          name: company.name,
          document: company.document ?? "",
          email: company.email ?? "",
          phone: company.phone ?? "",
        }
      : undefined,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Logo</Label>
          {company?.logo_url && (
            <img src={company.logo_url} alt="Logo" className="h-16 w-auto rounded border" />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAsset.mutateAsync({ file, kind: "logo" });
            }}
          />
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await updateCompany.mutateAsync(data);
              toast("Empresa atualizada");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Erro ao salvar");
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome</Label>
            <Input id="company-name" {...form.register("name")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-document">CNPJ/CPF</Label>
              <Input id="company-document" {...form.register("document")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Telefone</Label>
              <Input id="company-phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-email">E-mail</Label>
            <Input id="company-email" type="email" {...form.register("email")} />
          </div>
          <Button type="submit" className="touch-target" disabled={updateCompany.isPending}>
            Salvar empresa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ThemeTab() {
  const { data: settings, isLoading } = useCompanySettings();
  const updateSettings = useUpdateCompanySettings();
  const uploadAsset = useUploadCompanyAsset();
  const { toast } = useToast();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      primary_color: settings?.primary_color ?? DEFAULT_PRIMARY_COLOR,
      theme_mode: (settings?.theme_mode as SettingsInput["theme_mode"]) ?? "light",
      legal_footer: settings?.legal_footer ?? "",
      signature_image_url: settings?.signature_image_url ?? "",
      watermark_enabled: settings?.watermark_enabled ?? true,
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência e laudo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Assinatura (laudo)</Label>
          {settings?.signature_image_url && (
            <img src={settings.signature_image_url} alt="Assinatura" className="h-16 w-auto rounded border" />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadAsset.mutateAsync({ file, kind: "signature" });
            }}
          />
        </div>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (data) => {
            try {
              await updateSettings.mutateAsync(data);
              toast("Tema atualizado");
            } catch (err) {
              toast(err instanceof Error ? err.message : "Erro ao salvar");
            }
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor primária</Label>
              <Input id="primary_color" type="color" {...form.register("primary_color")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme_mode">Tema</Label>
              <select
                id="theme_mode"
                className="flex h-11 w-full touch-target rounded-md border border-input bg-background px-3 text-sm"
                {...form.register("theme_mode")}
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_footer">Rodapé jurídico (PDF)</Label>
            <textarea
              id="legal_footer"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("legal_footer")}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("watermark_enabled")} />
            Marca d&apos;água nas fotos
          </label>
          <Button type="submit" className="touch-target" disabled={updateSettings.isPending}>
            Salvar tema
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PrivacyTab() {
  const exportData = useExportMyData();
  const deleteAccount = useRequestAccountDeletion();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      lgpdService.downloadExport(data);
      toast("Dados exportados");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao exportar");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast("Conta anonimizada. Você será desconectado.");
      window.location.assign("/login");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao excluir conta");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacidade e LGPD</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Exercite seus direitos previstos na Lei Geral de Proteção de Dados (LGPD).
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="touch-target"
            disabled={exportData.isPending}
            onClick={() => void handleExport()}
          >
            Exportar meus dados (JSON)
          </Button>
          <Button asChild variant="outline" className="touch-target">
            <Link to="/privacidade" target="_blank">
              Política de privacidade
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">Excluir minha conta</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Anonimiza seu perfil e encerra a sessão. Vistorias e laudos permanecem por obrigação legal.
          </p>
          <Button
            type="button"
            variant="destructive"
            className="mt-3 touch-target"
            onClick={() => setConfirmOpen(true)}
          >
            Solicitar exclusão
          </Button>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirmar exclusão da conta?"
          description="Esta ação anonimiza seu perfil e não pode ser desfeita pelo app."
          confirmLabel="Excluir conta"
          destructive
          loading={deleteAccount.isPending}
          onConfirm={handleDelete}
        />
      </CardContent>
    </Card>
  );
}
