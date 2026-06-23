import { useParams } from "react-router-dom";
import { PdfDownloadButton } from "@/components/pdf/pdf-download-button";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspection, useInspectionChecklist } from "@/hooks/use-inspection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const { data: inspection, isLoading: loadingInspection } = useInspection(id);
  const { data: checklist = [], isLoading: loadingChecklist } = useInspectionChecklist(id);

  if (loadingInspection || loadingChecklist || !inspection) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <MobileBackButton to={`/vistorias/${id}`} label="Voltar à vistoria" />
      <h1 className="text-2xl font-bold">Laudo PDF</h1>
      <Card>
        <CardHeader>
          <CardTitle>Laudo #{inspection.inspection_number}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gera PDF profissional com dados do veículo, checklist, hash SHA-256 e código de verificação.
          </p>
          <PdfDownloadButton inspection={inspection} checklist={checklist} />
        </CardContent>
      </Card>
    </div>
  );
}
