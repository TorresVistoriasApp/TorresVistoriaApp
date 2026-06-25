import { useNavigate } from "react-router-dom";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { useCreateInspection } from "@/hooks/use-inspections";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import type { VistoriaInput } from "@/schemas/vistoria";

const WIZARD_FORM_ID = "nova-vistoria-form";

export function Page() {
  const navigate = useNavigate();
  const create = useCreateInspection();
  const { toast } = useToast();

  const handleSubmit = async (data: VistoriaInput) => {
    try {
      const inspection = await create.mutateAsync(data);
      toast("Dados salvos. Agora adicione as fotos.");
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspection.id)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar vistoria");
    }
  };

  return (
    <InspectionWizardShell
      currentStep={1}
      formId={WIZARD_FORM_ID}
      submitLabel="Salvar e continuar"
      isSubmitting={create.isPending}
      onCancel={() => navigate(ROUTES.inspections)}
    >
      <VistoriaForm
        formId={WIZARD_FORM_ID}
        wizardMode
        onBack={() => navigate(ROUTES.inspections)}
        onSubmit={handleSubmit}
        submitLabel={create.isPending ? "Salvando..." : "Salvar e continuar"}
      />
    </InspectionWizardShell>
  );
}
