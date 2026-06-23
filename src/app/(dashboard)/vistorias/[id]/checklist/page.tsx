import { useParams } from "react-router-dom";
import { ChecklistForm } from "@/components/forms/checklist-form";
import { MobileBackButton } from "@/components/shared/mobile-back-button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInspectionChecklist, useUpdateChecklistItem } from "@/hooks/use-checklist";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const { data: items = [], isLoading } = useInspectionChecklist(id);
  const updateItem = useUpdateChecklistItem(id!);

  return (
    <div className="space-y-6">
      <MobileBackButton to={`/vistorias/${id}`} label="Voltar à vistoria" />
      <h1 className="text-2xl font-bold">Checklist de estrutura</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ChecklistForm
          items={items}
          disabled={updateItem.isPending}
          onUpdate={(itemId, status) => {
            void updateItem.mutateAsync({
              id: itemId,
              patch: { status: status as "CONFORME" | "NAO_CONFORME" | "NA" },
            });
          }}
        />
      )}
    </div>
  );
}
