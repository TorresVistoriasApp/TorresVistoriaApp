import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PdfDownloadButton } from "@/components/pdf/pdf-download-button";
import { PdfPreview } from "@/components/pdf/pdf-preview";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspection, useInspectionChecklist } from "@/hooks/use-inspection";
import { useGenerateReport } from "@/hooks/use-inspections";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inspection, isLoading: loadingInspection } = useInspection(id);
  const { data: checklist = [], isLoading: loadingChecklist } = useInspectionChecklist(id);
  const generateReport = useGenerateReport();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!id) return;
    try {
      const result = (await generateReport.mutateAsync({ inspectionId: id })) as {
        verificationCode?: string;
      };
      setVerificationCode(result.verificationCode ?? null);
      toast("Laudo registrado com sucesso");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao gerar laudo");
    }
  };

  if (loadingInspection || loadingChecklist || !inspection) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          onClick={() => navigate(`/vistorias/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Laudo</h1>
      </div>

      {(verificationCode || generateReport.isSuccess) && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:bg-green-950/20">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Laudo registrado
            </p>
            {verificationCode && (
              <p className="text-xs text-green-600">Código: {verificationCode}</p>
            )}
          </div>
        </div>
      )}

      <PdfPreview inspection={inspection} checklist={checklist} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          className="touch-target h-12"
          onClick={() => void handleGenerate()}
          disabled={generateReport.isPending}
        >
          {generateReport.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Registrar laudo
            </>
          )}
        </Button>
        <PdfDownloadButton inspection={inspection} checklist={checklist} />
      </div>

      <Button variant="ghost" className="w-full touch-target" onClick={() => navigate("/vistorias")}>
        Voltar para lista
      </Button>
    </div>
  );
}
