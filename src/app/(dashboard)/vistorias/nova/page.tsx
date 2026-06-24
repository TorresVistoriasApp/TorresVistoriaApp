import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { useCreateInspection } from "@/hooks/use-inspections";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const navigate = useNavigate();
  const create = useCreateInspection();
  const { toast } = useToast();

  const handleSubmit = async (data: VistoriaInput) => {
    try {
      const inspection = await create.mutateAsync(data);
      toast("Vistoria criada — adicione fotos");
      navigate(`/vistorias/${inspection.id}/fotos`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao criar vistoria");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          onClick={() => navigate("/vistorias")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova vistoria</h1>
          <p className="text-xs text-muted-foreground">Passo 1 de 3 — Dados</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">1. Dados</span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">2. Fotos</span>
        <span className="text-muted-foreground">→</span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">3. Checklist</span>
      </div>

      <VistoriaForm
        onSubmit={handleSubmit}
        submitLabel={create.isPending ? "Salvando..." : "Salvar e continuar"}
      />
    </div>
  );
}
