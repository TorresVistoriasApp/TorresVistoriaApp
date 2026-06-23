import { useNavigate } from "react-router-dom";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { useCreateInspection } from "@/hooks/use-inspections";
import { useToast } from "@/hooks/use-toast";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const navigate = useNavigate();
  const create = useCreateInspection();
  const { toast } = useToast();

  const handleSubmit = async (data: VistoriaInput) => {
    try {
      const inspection = await create.mutateAsync(data);
      toast("Vistoria criada com sucesso");
      navigate(`/vistorias/${inspection.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar vistoria");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nova vistoria</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados do laudo cautelar</p>
      </div>
      <VistoriaForm onSubmit={handleSubmit} submitLabel="Criar vistoria" />
    </div>
  );
}
