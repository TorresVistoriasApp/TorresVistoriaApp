import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InspectionWizardShell } from "@/modules/torres-vistoria/components/vistoria/inspection-wizard-shell";
import { ServiceSelectorModal } from "@/modules/torres-vistoria/components/vistoria/service-selector-modal";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  useActiveDraft,
  useCreateDraftInspection,
} from "@/modules/torres-vistoria/draft/hooks/use-draft-recovery";
import { useToast } from "@/shared/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";
import type { PlatformService } from "@/modules/torres-vistoria/services/platform-service-service";

/**
 * Página de criação de nova vistoria.
 *
 * Fluxo novo:
 *   1. Verifica draft ativo → redireciona se existir
 *   2. Exibe ServiceSelectorModal (obrigatório)
 *   3. Ao selecionar serviço: cria draft com platform_service_id + inspection_order
 *   4. Redireciona para /fotos
 *
 * Compatibilidade legada: vistorias já existentes sem platform_service_id não
 * são afetadas. Apenas novas vistorias passam pelo modal.
 */
export function InspectionNewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: activeDraft, isLoading: loadingDraft } = useActiveDraft();
  const { mutate: createDraft, isPending } = useCreateDraftInspection();

  const [modalOpen, setModalOpen] = useState(false);
  const redirectedRef = useRef<string | null>(null);

  // Quando há draft ativo, redireciona sem abrir o modal
  useEffect(() => {
    if (loadingDraft) return;

    if (activeDraft) {
      if (redirectedRef.current === activeDraft.id) return;
      redirectedRef.current = activeDraft.id;
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(activeDraft.id)), { replace: true });
      return;
    }

    // Sem draft ativo: abre o modal de seleção de serviço
    setModalOpen(true);
  }, [activeDraft, loadingDraft, navigate]);

  const handleServiceSelect = useCallback(
    (service: PlatformService) => {
      // idempotencyKey gerado aqui — um UUID único por tentativa de criação.
      // Retries com o mesmo key retornam a order já criada sem duplicar.
      const idempotencyKey = crypto.randomUUID();

      createDraft(
        { platformServiceId: service.id, idempotencyKey },
        {
          onSuccess: (inspection) => {
            setModalOpen(false);
            navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspection.id)));
          },
          onError: (err) => {
            toast(err instanceof Error ? err.message : "Erro ao iniciar vistoria");
          },
        },
      );
    },
    [createDraft, navigate, toast],
  );

  const handleCancel = useCallback(() => {
    navigate(ROUTES.inspections);
  }, [navigate]);

  // Enquanto verifica draft ativo: mostra spinner neutro
  if (loadingDraft) {
    return (
      <InspectionWizardShell currentStep={1} title="Nova vistoria">
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Verificando rascunho..." />
        </div>
      </InspectionWizardShell>
    );
  }

  return (
    <InspectionWizardShell currentStep={1} title="Nova vistoria">
      {/* Spinner enquanto cria o draft após seleção do serviço */}
      {isPending && (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Criando vistoria..." />
        </div>
      )}

      <ServiceSelectorModal
        open={modalOpen}
        onSelect={handleServiceSelect}
        onCancel={handleCancel}
        isLoading={isPending}
      />
    </InspectionWizardShell>
  );
}
