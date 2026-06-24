import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { inspectionService } from "@/services/inspection-service";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatPlate } from "@/lib/formatters";
import { CheckCircle, XCircle } from "lucide-react";

type ValidationResult = {
  valid: boolean;
  message?: string;
  inspectionNumber?: number;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  parecer?: string;
  inspectionDate?: string;
  generatedAt?: string;
  hash?: string;
};

export function Page() {
  const { codigo } = useParams<{ codigo: string }>();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) {
      setLoading(false);
      return;
    }

    void inspectionService
      .validateReport(codigo)
      .then((data) => setResult(data as ValidationResult))
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao validar"))
      .finally(() => setLoading(false));
  }, [codigo]);

  if (!codigo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validar laudo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Informe o código de verificação na URL: <code>/validar/TV-XXXX</code>
        </CardContent>
      </Card>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!result?.valid) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          <CardTitle>Laudo não encontrado</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {result?.message ?? "Código inválido ou laudo removido."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <CardTitle>Laudo autêntico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">Código: <span className="font-mono">{codigo}</span></p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Número</p>
            <p className="font-medium">#{result.inspectionNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="font-medium">{formatPlate(result.vehiclePlate ?? "")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Veículo</p>
            <p className="font-medium">
              {result.vehicleBrand} {result.vehicleModel}
            </p>
          </div>
          {result.parecer && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Parecer</p>
              <p className="font-medium">{String(result.parecer).replace(/_/g, " ")}</p>
            </div>
          )}
          {result.inspectionDate && (
            <div>
              <p className="text-xs text-muted-foreground">Data da vistoria</p>
              <p className="font-medium">{formatDate(result.inspectionDate)}</p>
            </div>
          )}
          {result.generatedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Laudo gerado em</p>
              <p className="font-medium">{formatDate(result.generatedAt)}</p>
            </div>
          )}
        </div>
        {result.hash && (
          <p className="break-all text-xs text-muted-foreground">
            Hash: {result.hash.slice(0, 16)}…
          </p>
        )}
        <Button asChild variant="outline" className="touch-target">
          <Link to="/login">Acessar sistema</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
