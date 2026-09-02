import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { inspectionService } from "@/modules/torres-vistoria/services/inspection-service";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { CheckCircle, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useTurnstile } from "@/core/security/use-turnstile";
import type { ReportValidationResult } from "@/modules/torres-vistoria/domain/laudo/validation-types";
import { cn } from "@/shared/lib/utils";

function ValidationField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground sm:text-right">{value}</span>
    </div>
  );
}

export function ValidateReportPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const turnstile = useTurnstile("validate-report");
  const [result, setResult] = useState<ReportValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) {
      setLoading(false);
      return;
    }

    if (turnstile.required && !turnstile.token) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void inspectionService
      .validateReport(decodeURIComponent(codigo), turnstile.token ?? undefined)
      .then((data) => {
        if (!cancelled) setResult(data as ReportValidationResult);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao validar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [codigo, turnstile.required, turnstile.token]);

  if (!codigo) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Informe o código de verificação na URL: <code>/validar/TV-K7M2-9XQH-4NWP</code>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {turnstile.field}
        <LoadingSpinner label="Verificando laudo..." />
      </div>
    );
  }

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
    <Card className="overflow-hidden">
      <div
        className={cn(
          "border-b px-6 py-10 text-center",
          isIntegro
            ? "border-success-border bg-success-subtle"
            : "border-warning-border bg-warning-subtle",
        )}
      >
        {isIntegro ? (
          <CheckCircle className="mx-auto mb-3 h-14 w-14 text-success" strokeWidth={1.75} />
        ) : (
          <ShieldAlert className="mx-auto mb-3 h-14 w-14 text-warning" strokeWidth={1.75} />
        )}
        <h1
          className={cn(
            "text-2xl font-bold tracking-wide",
            isIntegro ? "text-success" : "text-warning",
          )}
        >
          {isIntegro ? "LAUDO VÁLIDO" : "LAUDO REGISTRADO"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verificação oficial Torres Vistoria
        </p>
      </div>

      <CardContent className="px-6 pb-8 pt-2">
        <div className="rounded-lg border border-border bg-muted px-4">
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

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-success-border bg-success-subtle p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
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
