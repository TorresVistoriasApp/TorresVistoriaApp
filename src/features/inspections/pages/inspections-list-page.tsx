import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ROUTES } from "@/lib/constants";

export function InspectionsListPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vistorias</h1>
          <p className="text-sm text-muted-foreground">Histórico e gestão de laudos</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.inspectionNew}>
            <Plus className="h-4 w-4" />
            Nova
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nenhuma vistoria ainda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure o backend e crie a primeira vistoria cautelar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
