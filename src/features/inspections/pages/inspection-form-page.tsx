import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function InspectionFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar vistoria" : "Nova vistoria"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Formulário completo com checklist, fotos e parecer técnico
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Próximos blocos: identificação, cliente, veículo, checklist e upload de fotos.</p>
          <p>O número da vistoria será auto-incrementado por empresa via trigger PostgreSQL.</p>
        </CardContent>
      </Card>
    </div>
  );
}
