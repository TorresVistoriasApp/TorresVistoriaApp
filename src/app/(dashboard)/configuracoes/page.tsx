import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";

export function Page() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/configuracoes/perfil">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {profile?.full_name} — {profile?.role}
            </CardContent>
          </Card>
        </Link>
        <RequireRole roles={[UserRole.SUPER_ADMIN]}>
          <>
            <Link to="/configuracoes/empresa">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle>Empresa</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Logo, rodapé jurídico</CardContent>
              </Card>
            </Link>
            <Link to="/configuracoes/usuarios">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle>Usuários</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Gestão de equipe</CardContent>
              </Card>
            </Link>
            <Link to="/configuracoes/auditoria">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader><CardTitle>Auditoria</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">Histórico de alterações</CardContent>
              </Card>
            </Link>
          </>
        </RequireRole>
      </div>
    </div>
  );
}
