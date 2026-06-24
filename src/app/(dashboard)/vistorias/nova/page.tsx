import { useNavigate } from "react-router-dom";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { useCreateInspection } from "@/hooks/use-inspections";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const navigate = useNavigate();
  const create = useCreateInspection();
  const { toast } = useToast();

  const handleSubmit = async (data: VistoriaInput) => {
    try {
      const inspection = await create.mutateAsync(data);
      toast("Dados salvos — agora adicione as fotos");
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspection.id)));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar vistoria");
    }
  };

  return (
    <InspectionWizardShell currentStep={1}>
      <VistoriaForm
        wizardMode
        onBack={() => navigate(ROUTES.inspections)}
        onSubmit={handleSubmit}
        submitLabel={create.isPending ? "Salvando..." : "Salvar e continuar"}
      />
    </InspectionWizardShell>
  );
}
