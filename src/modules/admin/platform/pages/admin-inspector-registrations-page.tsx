import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { getErrorMessage } from "@/core/errors/app-error";
import { platformCompanyService } from "@/modules/admin/platform/services/platform-company-service";
import {
  platformInspectorRegistrationService,
  type InspectorRegistrationListItem,
} from "@/modules/admin/platform/services/platform-inspector-registration-service";
import { UserRole, ROLE_LABELS } from "@/core/rbac/roles";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { redactEmail, redactPhone } from "@/shared/lib/pii";

function formatDocumentLabel(item: InspectorRegistrationListItem): string {
  const label = item.document_type === "cnpj" ? "CNPJ" : "CPF";
  return `${label} ·••• ${item.document_tail}`;
}

export function AdminInspectorRegistrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin", "inspector-registrations"],
    queryFn: () => platformInspectorRegistrationService.listPending(),
  });

  const { data: companies } = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: () => platformCompanyService.list(),
  });

  const [tenantSelections, setTenantSelections] = useState<Record<string, string>>({});
  const [roleSelections, setRoleSelections] = useState<Record<string, UserRole>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "inspector-registrations"] });
  };

  const handleApprove = async (item: InspectorRegistrationListItem) => {
    const tenantId = tenantSelections[item.id] ?? item.suggestedTenantId ?? "";
    const role = roleSelections[item.id] ?? UserRole.INSPECTOR;

    if (!tenantId) {
      toast({ type: "error", title: "Selecione a empresa para vincular o cadastro." });
      return;
    }

    setProcessingId(item.id);
    try {
      await platformInspectorRegistrationService.approve({
        registrationId: item.id,
        tenantId,
        role,
      });
      toast({ type: "success", title: "Cadastro aprovado com sucesso." });
      await refresh();
    } catch (error) {
      toast({
        type: "error",
        title: "Não foi possível aprovar",
        description: getErrorMessage(error),
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: InspectorRegistrationListItem) => {
    setProcessingId(item.id);
    try {
      await platformInspectorRegistrationService.reject({
        registrationId: item.id,
        rejectionReason: rejectionReasons[item.id],
      });
      toast({ type: "success", title: "Cadastro recusado." });
      await refresh();
    } catch (error) {
      toast({
        type: "error",
        title: "Não foi possível recusar",
        description: getErrorMessage(error),
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Cadastros pendentes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aprove ou recuse solicitações de vistoriadores antes de liberar o painel.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to={ROUTES.adminCompanies}>Voltar às empresas</Link>
        </Button>
      </div>

      {!registrations?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Clock3 className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-semibold">Nenhum cadastro pendente</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Quando um vistoriador solicitar cadastro em /vistoria/cadastro, ele aparecerá aqui para
              análise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{item.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{redactEmail(item.email)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="rounded-full bg-muted px-3 py-1 font-medium">
                    {formatDocumentLabel(item)}
                  </span>
                  {item.phone && (
                    <span className="text-muted-foreground">Tel: {redactPhone(item.phone)}</span>
                  )}
                  {item.suggestedTenantName && (
                    <span className="text-success">Sugestão: {item.suggestedTenantName}</span>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={tenantSelections[item.id] ?? item.suggestedTenantId ?? ""}
                      onChange={(event) =>
                        setTenantSelections((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Selecione a empresa</option>
                      {(companies ?? []).map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.trade_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Função</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={roleSelections[item.id] ?? UserRole.INSPECTOR}
                      onChange={(event) =>
                        setRoleSelections((prev) => ({
                          ...prev,
                          [item.id]: event.target.value as UserRole,
                        }))
                      }
                    >
                      <option value={UserRole.INSPECTOR}>
                        {ROLE_LABELS[UserRole.INSPECTOR]}
                      </option>
                      <option value={UserRole.SUPER_ADMIN}>
                        {ROLE_LABELS[UserRole.SUPER_ADMIN]}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Motivo da recusa (opcional)</Label>
                  <Input
                    placeholder="Informe o motivo se for recusar o cadastro"
                    value={rejectionReasons[item.id] ?? ""}
                    onChange={(event) =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => void handleApprove(item)}
                    disabled={processingId === item.id}
                  >
                    <Check className="h-4 w-4" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void handleReject(item)}
                    disabled={processingId === item.id}
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
