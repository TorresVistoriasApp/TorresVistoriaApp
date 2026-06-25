import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { inspectionService } from "@/services/inspection-service";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { ReportValidationResult } from "@/lib/laudo/validation-types";
import { cn } from "@/lib/utils";

function ValidationField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground sm:text-right">{value}</span>
    </div>
  );
}

export function Page() {
  const { codigo } = useParams<{ codigo: string }>();
  const [result, setResult] = useState<ReportValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) {
      setLoading(false);
      return;
    }

    void inspectionService
      .validateReport(decodeURIComponent(codigo))
      .then((data) => setResult(data as ReportValidationResult))
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao validar"))
      .finally(() => setLoading(false));
  }, [codigo]);

  if (!codigo) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Informe o código de verificação na URL: <code>/validar/TV-2026-000148</code>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner label="Verificando laudo..." />;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!result?.valid) {
    return (
      <Card className="overflow-hidden border-destructive/30">
        <div className="bg-destructive/10 px-6 py-8 text-center">
          <XCircle className="mx-auto mb-3 h-12 w-12 text-destructive" />
          <h1 className="text-xl font-bold tracking-wide text-destructive">LAUDO NÃO ENCONTRADO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {result?.message ?? "Código inválido ou laudo removido."}
          </p>
        </div>
        <CardContent className="py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Código informado: <span className="font-mono">{decodeURIComponent(codigo)}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  const isIntegro = result.hashStatus === "OK";
  const hashLabel = result.hashStatus ?? "INDISPONIVEL";

  return (
    <Card className="overflow-hidden border-green-600/20 shadow-lg">
      <div
        className={cn(
          "px-6 py-10 text-center",
          isIntegro ? "bg-green-600/10" : "bg-amber-500/10",
        )}
      >
        {isIntegro ? (
          <CheckCircle className="mx-auto mb-3 h-14 w-14 text-green-600" />
        ) : (
          <ShieldAlert className="mx-auto mb-3 h-14 w-14 text-amber-600" />
        )}
        <h1
          className={cn(
            "text-2xl font-bold tracking-wide",
            isIntegro ? "text-green-700" : "text-amber-700",
          )}
        >
          {isIntegro ? "LAUDO VÁLIDO" : "LAUDO REGISTRADO"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verificação oficial Torres Vistoria
        </p>
      </div>

      <CardContent className="px-6 pb-8 pt-2">
        <div className="rounded-lg border border-border/60 bg-muted/20 px-4">
          <ValidationField label="Empresa" value={result.companyName ?? "Torres Vistoria"} />
          <ValidationField label="Número" value={result.laudoNumber ?? result.verificationCode ?? "-"} />
          <ValidationField
            label="Emitido em"
            value={result.issuedAtFormatted ?? "-"}
          />
          <ValidationField
            label="Hash"
            value={hashLabel}
          />
          <ValidationField
            label="Status"
            value={result.status ?? (isIntegro ? "Documento íntegro" : "Verificação pendente")}
          />
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-green-600/20 bg-green-600/5 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <p>
            A integridade do documento é verificada comparando o hash SHA-256 do arquivo PDF
            armazenado com o registro emitido no momento da geração do laudo.
          </p>
        </div>

        <Button asChild variant="outline" className="mt-6 w-full touch-target">
          <Link to={ROUTES.login}>Acessar sistema Torres Vistoria</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
