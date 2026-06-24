import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { useInspection } from "@/hooks/use-inspection";
import { useUpdateInspection } from "@/hooks/use-inspections";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/lib/rbac";
import { formatVistoriaFormDefaults } from "@/lib/vistoria-form-defaults";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { profile } = useAuth();
  const { data: inspection, isLoading } = useInspection(id);
  const update = useUpdateInspection(id!);

  if (isLoading || !inspection) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = async (data: VistoriaInput) => {
    await update.mutateAsync(data);
    if (isWizardFlow) {
      navigate(`/vistorias/${id}/fotos?fluxo=nova`);
      return;
    }
    navigate(`/vistorias/${id}`);
  };

  const form = (
    <VistoriaForm
      defaultValues={formatVistoriaFormDefaults(inspection)}
      onSubmit={handleSubmit}
      submitLabel={isWizardFlow ? "Salvar e continuar" : "Salvar alterações"}
      showInternalNotes={isSuperAdmin(profile?.role)}
      wizardMode={isWizardFlow}
      onBack={isWizardFlow ? () => navigate("/vistorias") : undefined}
    />
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={1}
        inspectionId={id}
        title={`Vistoria #${inspection.inspection_number}`}
      >
        {form}
      </InspectionWizardShell>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar vistoria #{inspection.inspection_number}</h1>
      {form}
    </div>
  );
}
