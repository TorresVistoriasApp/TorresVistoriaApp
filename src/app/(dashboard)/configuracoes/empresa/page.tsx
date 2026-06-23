import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
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
import { companySchema, settingsSchema, type CompanyInput, type SettingsInput } from "@/schemas/settings";
import { DEFAULT_PRIMARY_COLOR } from "@/lib/constants";

export function Page() {
  const { data: company, isLoading: loadingCompany } = useCompany();
  const { data: settings, isLoading: loadingSettings } = useCompanySettings();
  const updateCompany = useUpdateCompany();
  const updateSettings = useUpdateCompanySettings();
  const uploadAsset = useUploadCompanyAsset();

  const companyForm = useForm<CompanyInput>({
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

  const settingsForm = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    values: {
      primary_color: settings?.primary_color ?? DEFAULT_PRIMARY_COLOR,
      theme_mode: (settings?.theme_mode as SettingsInput["theme_mode"]) ?? "light",
      legal_footer: settings?.legal_footer ?? "",
      signature_image_url: settings?.signature_image_url ?? "",
      watermark_enabled: settings?.watermark_enabled ?? true,
    },
  });

  if (loadingCompany || loadingSettings) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Empresa</h1>

        <Card>
          <CardHeader>
            <CardTitle>Dados cadastrais</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={companyForm.handleSubmit((data) => updateCompany.mutate(data))}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...companyForm.register("name")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ/CPF</Label>
                  <Input id="document" {...companyForm.register("document")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" {...companyForm.register("phone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...companyForm.register("email")} />
              </div>
              <Button type="submit" disabled={updateCompany.isPending}>
                Salvar empresa
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identidade visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
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
              <div className="space-y-2">
                <Label>Assinatura (laudo)</Label>
                {settings?.signature_image_url && (
                  <img
                    src={settings.signature_image_url}
                    alt="Assinatura"
                    className="h-16 w-auto rounded border"
                  />
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
            </div>

            <form
              className="space-y-4"
              onSubmit={settingsForm.handleSubmit((data) => updateSettings.mutate(data))}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Cor primária</Label>
                  <Input id="primary_color" type="color" {...settingsForm.register("primary_color")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme_mode">Tema</Label>
                  <select
                    id="theme_mode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    {...settingsForm.register("theme_mode")}
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
                  {...settingsForm.register("legal_footer")}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...settingsForm.register("watermark_enabled")} />
                Marca d&apos;água nas fotos
              </label>
              <Button type="submit" disabled={updateSettings.isPending}>
                Salvar aparência
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireRole>
  );
}
