import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function SettingsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <Card>
        <CardHeader><CardTitle>Empresa e personalização</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Logo, assinatura digitalizada, rodapé jurídico, cores do tema e perfil do usuário.
        </CardContent>
      </Card>
    </div>
  );
}
