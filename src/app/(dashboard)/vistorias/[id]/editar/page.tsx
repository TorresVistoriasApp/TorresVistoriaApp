import { useNavigate, useParams } from "react-router-dom";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { useInspection } from "@/hooks/use-inspection";
import { useUpdateInspection } from "@/hooks/use-inspections";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/lib/rbac";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    navigate(`/vistorias/${id}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar vistoria #{inspection.inspection_number}</h1>
      <VistoriaForm
        defaultValues={inspection as unknown as VistoriaInput}
        onSubmit={handleSubmit}
        submitLabel="Salvar alterações"
        showInternalNotes={isSuperAdmin(profile?.role)}
      />
    </div>
  );
}
