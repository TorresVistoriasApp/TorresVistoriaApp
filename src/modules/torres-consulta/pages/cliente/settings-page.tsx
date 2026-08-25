import { useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ConsumerPageHeader } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import { ConsumerSurface } from "@/modules/torres-consulta/components/consumer-app/consumer-surface";
import { SettingsSection } from "@/shared/components/settings/settings-section";

export function ClienteSettingsPage() {
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ConsumerPageHeader
        title="Configurações"
        subtitle="Privacidade, LGPD e preferências da sua conta."
      />

      <SettingsSection
        icon={Trash2}
        title="Privacidade e LGPD"
        description="Exercite seus direitos conforme a Lei Geral de Proteção de Dados."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted p-4">
            <h3 className="font-semibold text-foreground">Documentos legais</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link to={ROUTES.privacy} className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to={ROUTES.termos} className="text-primary hover:underline">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to={ROUTES.lgpd} className="text-primary hover:underline">
                  Informações sobre LGPD
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setExportRequested(true)}
              disabled={exportRequested}
            >
              <Download className="h-4 w-4" />
              {exportRequested ? "Solicitação enviada" : "Exportar meus dados"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteRequested(true)}
              disabled={deleteRequested}
            >
              <Trash2 className="h-4 w-4" />
              {deleteRequested ? "Solicitação registrada" : "Solicitar exclusão da conta"}
            </Button>
          </div>

          {(deleteRequested || exportRequested) && (
            <div
              role="status"
              className="flex gap-3 rounded-lg border border-warning-border bg-warning-subtle p-4 text-sm text-foreground"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p>
                Sua solicitação foi registrada e será processada conforme os prazos legais e as
                políticas da plataforma. A exclusão não é imediata. Você receberá confirmação por
                e-mail quando o processo for concluído.
              </p>
            </div>
          )}
        </div>
      </SettingsSection>

      <ConsumerSurface>
        <h2 className="text-[17px] font-bold text-foreground">Preferências</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Notificações e comunicações (em breve).
        </p>
        <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <input type="checkbox" disabled className="h-4 w-4 rounded" />
          Receber novidades e ofertas por e-mail
        </label>
      </ConsumerSurface>
    </div>
  );
}
