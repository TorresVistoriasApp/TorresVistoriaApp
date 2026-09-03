import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { EvaluationSection } from "@/modules/torres-vistoria/components/vistoria/evaluation-section";
import {
  LaudoReadinessList,
  LaudoReadinessSummary,
  buildLaudoReadiness,
} from "@/modules/torres-vistoria/components/laudo/laudo-readiness";
import {
  LaudoChecklistSummary,
  LaudoDataSummary,
  LaudoPhotosGrid,
} from "@/modules/torres-vistoria/components/laudo/laudo-review-sections";
import { PdfDownloadButton } from "@/modules/torres-vistoria/components/pdf/pdf-download-button";
import { PdfPreview } from "@/modules/torres-vistoria/components/pdf/pdf-preview";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { CheckCircle2, FileText } from "lucide-react";

interface LaudoReviewPanelProps {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  verificationCode?: string | null;
  generating?: boolean;
  onGenerate: () => void;
  onFixItem: (itemId: string) => void;
  onFinish?: () => void;
  showFinishAction?: boolean;
}

export function LaudoReviewPanel({
  inspection,
  checklist,
  photos,
  company,
  settings,
  inspector,
  verificationCode,
  generating,
  onGenerate,
  onFixItem,
  onFinish,
  showFinishAction,
}: LaudoReviewPanelProps) {
  const readinessItems = buildLaudoReadiness(inspection, checklist, photos);
  const isReady = readinessItems.every((item) => item.ok);
  const pendingCount = readinessItems.filter((item) => !item.ok).length;

  return (
    <div className="w-full space-y-3 pb-24 sm:space-y-4 sm:pb-0">
      <LaudoReadinessSummary inspection={inspection} items={readinessItems} />

      <EvaluationSection
        id="laudo-conferencia"
        title="Conferência"
        subtitle="Verifique pendências antes de emitir"
        defaultOpen
        statusText={isReady ? "Completo" : `${pendingCount} pendência(s)`}
        statusTone={isReady ? "success" : "warning"}
      >
        <LaudoReadinessList items={readinessItems} onFix={onFixItem} compact />
      </EvaluationSection>

      <EvaluationSection
        id="laudo-dados"
        title="Dados da vistoria"
        subtitle="Contratante, veículo e identificação"
      >
        <LaudoDataSummary inspection={inspection} />
      </EvaluationSection>

      <EvaluationSection
        id="laudo-fotos"
        title="Fotografias"
        subtitle={`${photos.length} foto(s) registrada(s)`}
        statusText={readinessItems.find((i) => i.id === "photos")?.ok ? "Ok" : "Pendente"}
        statusTone={readinessItems.find((i) => i.id === "photos")?.ok ? "success" : "warning"}
      >
        <LaudoPhotosGrid
          photos={photos}
          onViewAll={!readinessItems.find((i) => i.id === "photos")?.ok ? () => onFixItem("photos") : undefined}
        />
      </EvaluationSection>

      <EvaluationSection
        id="laudo-checklist"
        title="Checklist e parecer"
        subtitle="Resumo da avaliação técnica"
        statusText={readinessItems.find((i) => i.id === "checklist")?.ok ? "Ok" : "Pendente"}
        statusTone={readinessItems.find((i) => i.id === "checklist")?.ok ? "success" : "warning"}
      >
        <LaudoChecklistSummary inspection={inspection} checklist={checklist} />
      </EvaluationSection>

      <EvaluationSection
        id="laudo-preview"
        title="Pré-visualização"
        subtitle="Resumo do laudo antes do PDF"
      >
        <PdfPreview
          inspection={inspection}
          checklist={checklist}
          photos={photos}
          company={company}
          settings={settings}
          inspector={inspector}
        />
      </EvaluationSection>

      {verificationCode && (
        <div className="flex items-start gap-2.5 rounded-lg border border-success-border bg-success-subtle px-3.5 py-3">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-success">Laudo emitido</p>
            <p className="mt-0.5 text-xs text-success">
              Código: <span className="font-mono font-bold">{verificationCode}</span>
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "space-y-3 rounded-xl border border-border bg-card p-3.5 shadow-soft sm:p-4",
          "max-sm:fixed max-sm:bottom-20 max-sm:left-0 max-sm:right-0 max-sm:z-20",
          "max-sm:mx-3 max-sm:rounded-xl max-sm:border-border max-sm:bg-card max-sm:shadow-elevated",
        )}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            className="touch-target h-11 w-full sm:h-12"
            onClick={onGenerate}
            disabled={generating || !isReady}
          >
            {generating ? (
              <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                <FileText className="mr-2 size-4" />
                Emitir laudo oficial
              </>
            )}
          </Button>
          <PdfDownloadButton
            className="touch-target h-11 w-full sm:h-12"
            variant="outline"
            disabled={generating || !isReady}
            inspection={inspection}
            checklist={checklist}
            photos={photos}
            company={company}
            settings={settings}
            inspector={inspector}
          />
        </div>

        {showFinishAction && onFinish && (
          <Button
            type="button"
            variant={verificationCode ? "default" : "outline"}
            className="touch-target hidden w-full sm:flex"
            onClick={onFinish}
          >
            {verificationCode ? "Concluir e ir para vistorias" : "Salvar rascunho e sair"}
          </Button>
        )}
      </div>
    </div>
  );
}

export type { LaudoReadinessItem } from "@/modules/torres-vistoria/components/laudo/laudo-readiness";
