import { Link } from "react-router-dom";
import { Clock3, LogOut } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function InspectorPendingApprovalPage() {
  const { signOut } = useAuth();
  const { resolution } = usePrincipal();

  const registration =
    resolution.status === "resolved" &&
    resolution.principalType === PrincipalType.PENDING_INSPECTOR
      ? resolution.inspectorRegistration
      : null;

  const documentLabel =
    registration?.document_type === "cnpj"
      ? `CNPJ terminado em ${registration.document_tail}`
      : `CPF terminado em ${registration?.document_tail ?? "—"}`;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-12">
      <Card className="w-full max-w-lg border-border/70 shadow-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
            <Clock3 className="h-7 w-7" />
          </div>
          <CardTitle className="text-xl">Cadastro em análise</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {inspectorAuthService.getPendingMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {registration && (
            <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
              <p className="font-semibold text-foreground">{registration.full_name}</p>
              <p className="text-muted-foreground">{registration.email}</p>
              <p className="mt-1 text-muted-foreground">{documentLabel}</p>
            </div>
          )}

          <p className="text-sm leading-relaxed text-muted-foreground">
            Nossa equipe validará seus dados e vinculará sua conta à empresa correspondente. Você
            receberá acesso ao painel Torres Vistoria após a aprovação.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full" asChild>
              <Link to={ROUTES.consultaLanding}>Voltar ao site</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
