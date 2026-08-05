import { useState } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function ClienteSettingsPage() {
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [exportRequested, setExportRequested] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privacidade, LGPD e preferências da sua conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacidade e LGPD</CardTitle>
          <CardDescription>
            Exercite seus direitos conforme a Lei Geral de Proteção de Dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
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
              className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-900"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Sua solicitação foi registrada e será processada conforme os prazos legais e as
                políticas da plataforma. A exclusão de conta não é imediata — você receberá
                confirmação por e-mail quando o processo for concluído.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferências</CardTitle>
          <CardDescription>Notificações e comunicações (em breve).</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <input type="checkbox" disabled className="h-4 w-4 rounded" />
            Receber novidades e ofertas por e-mail
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
