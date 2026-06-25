import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { FormSectionCard } from "@/components/forms/form-section-card";
import {
  LaudoReadinessList,
  LaudoReadinessSummary,
  buildLaudoReadiness,
  type LaudoReadinessItem,
} from "@/components/laudo/laudo-readiness";
import { PdfDownloadButton } from "@/components/pdf/pdf-download-button";
import { PdfPreview } from "@/components/pdf/pdf-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, FileText, Info } from "lucide-react";

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
  const readyStatus = isReady ? "Pronto" : "Pendente";

  return (
    <div className="w-full space-y-5 sm:space-y-6 lg:space-y-5">
      <LaudoReadinessSummary inspection={inspection} items={readinessItems} />

      <FormSectionCard
        id="laudo-conferencia"
        index={1}
        title="Conferência final"
        description="Verifique se dados, fotos, checklist e parecer estão completos"
        statusLabel={readyStatus}
      >
        <LaudoReadinessList items={readinessItems} onFix={onFixItem} />
      </FormSectionCard>

      <FormSectionCard
        id="laudo-preview"
        index={2}
        title="Pré-visualização"
        description="Resumo do laudo antes da emissão do PDF"
      >
        <PdfPreview
          inspection={inspection}
          checklist={checklist}
          photos={photos}
          company={company}
          settings={settings}
          inspector={inspector}
        />
      </FormSectionCard>

      <FormSectionCard
        id="laudo-emissao"
        index={3}
        title="Emissão do laudo"
        description="Gere o PDF profissional com QR de validação e registro da vistoria"
        statusLabel={verificationCode ? "Emitido" : undefined}
      >
        <div className="space-y-4">
          {verificationCode && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-900">Laudo registrado com sucesso</p>
                <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
                  Código de validação:{" "}
                  <span className="font-mono font-bold">{verificationCode}</span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="touch-target h-12 w-full"
              onClick={onGenerate}
              disabled={generating || !isReady}
            >
              {generating ? (
                <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <>
                  <FileText className="mr-2 size-5" />
                  Gerar, registrar e baixar
                </>
              )}
            </Button>
            <PdfDownloadButton
              className="touch-target h-12 w-full"
              variant="outline"
              disabled={!isReady}
              inspection={inspection}
              checklist={checklist}
              photos={photos}
              company={company}
              settings={settings}
              inspector={inspector}
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-3 text-xs leading-relaxed text-sky-900">
            <Info className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
            <p>
              O PDF usa os dados de Configurações: razão social, CPF/CNPJ, endereço da empresa e
              vistoriador responsável. Inclui fotos, checklist, parecer e validação pública.
            </p>
          </div>

          {showFinishAction && onFinish && (
            <Button
              type="button"
              variant={verificationCode ? "default" : "outline"}
              className={cn("touch-target w-full", verificationCode && "h-12")}
              onClick={onFinish}
            >
              {verificationCode ? "Concluir e ir para vistorias" : "Salvar rascunho e sair"}
            </Button>
          )}
        </div>
      </FormSectionCard>
    </div>
  );
}

export type { LaudoReadinessItem };
