import { Link, useNavigate, useParams } from "react-router-dom";
import { useInspection } from "@/hooks/use-inspection";
import { useInspectionPhotos } from "@/hooks/use-photos";
import { useInspectionChecklist } from "@/hooks/use-checklist";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { RoleGuard } from "@/components/shared/role-guard";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatDate,
  formatDocument,
  formatKM,
  formatPhone,
  formatPlate,
} from "@/lib/formatters";
import { UserRole } from "@/lib/enums";
import { Camera, ClipboardList, Edit, FileText, ArrowLeft } from "lucide-react";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inspection, isLoading, error } = useInspection(id);
  const { data: photos = [] } = useInspectionPhotos(id);
  const { data: checklist = [] } = useInspectionChecklist(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-muted-foreground">Vistoria não encontrada</p>
        <Button onClick={() => navigate("/vistorias")}>Voltar</Button>
      </div>
    );
  }

  const conformeCount = checklist.filter((i) => i.status === "CONFORME").length;

  return (
    <div className="space-y-4">
      <div className="page-header-strip">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="mt-0.5 shrink-0 touch-target"
              onClick={() => navigate("/vistorias")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold sm:text-2xl">#{inspection.inspection_number}</h1>
                <VistoriaStatusBadge status={inspection.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(inspection.inspection_date)}
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap justify-end gap-2 lg:w-auto">
            <Button asChild variant="outline" size="sm" className="touch-target">
              <Link to={`/vistorias/${id}/editar`}>
                <Edit className="h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button asChild size="sm" className="touch-target">
              <Link to={`/vistorias/${id}/laudo`}>
                <FileText className="h-4 w-4" />
                Gerar laudo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          className="flex h-auto touch-target flex-col py-3"
          onClick={() => navigate(`/vistorias/${id}/editar`)}
        >
          <Edit className="mb-1 h-5 w-5" />
          <span className="text-xs">Editar</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto touch-target flex-col py-3"
          onClick={() => navigate(`/vistorias/${id}/fotos`)}
        >
          <Camera className="mb-1 h-5 w-5" />
          <span className="text-xs">Fotos</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto touch-target flex-col py-3"
          onClick={() => navigate(`/vistorias/${id}/checklist`)}
        >
          <ClipboardList className="mb-1 h-5 w-5" />
          <span className="text-xs">Checklist</span>
        </Button>
        <Button
          variant="outline"
          className="flex h-auto touch-target flex-col py-3"
          onClick={() => navigate(`/vistorias/${id}/laudo`)}
        >
          <FileText className="mb-1 h-5 w-5" />
          <span className="text-xs">Laudo</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">{inspection.client_name}</p>
          <p className="text-muted-foreground">{formatDocument(inspection.client_document)}</p>
          {inspection.client_phone && (
            <p className="text-muted-foreground">{formatPhone(inspection.client_phone)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Veículo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatPlate(inspection.plate)}</span>
            <span className="rounded-full border px-2 py-0.5 text-xs">
              {inspection.situation.replace(/_/g, " ")}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Marca / Modelo</p>
              <p className="font-medium">
                {inspection.brand} {inspection.model}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ano</p>
              <p className="font-medium">
                {inspection.manufacture_year}/{inspection.model_year}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cor</p>
              <p className="font-medium">{inspection.color}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">KM</p>
              <p className="font-medium">{formatKM(inspection.mileage)}</p>
            </div>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{inspection.chassis}</p>
        </CardContent>
      </Card>

      {inspection.opinion && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Parecer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{inspection.opinion.replace(/_/g, " ")}</p>
            {inspection.technical_notes && (
              <p className="mt-2 text-sm text-muted-foreground">{inspection.technical_notes}</p>
            )}
          </CardContent>
        </Card>
      )}

      {photos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Fotos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(0, 6).map((photo) => (
                <div key={photo.id} className="aspect-square overflow-hidden rounded-lg bg-muted">
                  {photo.public_url && (
                    <img
                      src={photo.public_url}
                      alt={photo.category}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
            <Button asChild variant="ghost" className="mt-2 px-0">
              <Link to={`/vistorias/${id}/fotos`}>Ver todas</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {checklist.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {conformeCount}/{checklist.length} itens conformes
          </CardContent>
        </Card>
      )}

      <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
        {inspection.internal_notes && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-amber-800 dark:text-amber-200">
                Comentários internos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{inspection.internal_notes}</p>
            </CardContent>
          </Card>
        )}
      </RoleGuard>
    </div>
  );
}
