import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useTeamProfiles, useUpdateUserRole } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/formatters";
import { DEFAULT_COMPANY_ID } from "@/lib/constants";

export function Page() {
  const { profile: currentProfile } = useAuth();
  const { data: team = [], isLoading } = useTeamProfiles();
  const updateRole = useUpdateUserRole();

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuários</h1>

        <Card>
          <CardHeader>
            <CardTitle>Convidar novo usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Crie o usuário no painel Supabase (Authentication → Users) com os metadados:
            </p>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
{`{
  "company_id": "${DEFAULT_COMPANY_ID}",
  "role": "VISTORIADOR"
}`}
            </pre>
            <p>O trigger <code className="text-xs">handle_new_user</code> cria o perfil automaticamente.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipe ({team.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : team.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Função</th>
                      <th className="px-4 py-2 text-left">Desde</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member) => (
                      <tr key={member.id} className="border-t border-border">
                        <td className="px-4 py-2 font-medium">{member.full_name}</td>
                        <td className="px-4 py-2">
                          {member.id === currentProfile?.id ? (
                            <span>{member.role}</span>
                          ) : (
                            <select
                              className="rounded border border-input bg-background px-2 py-1 text-sm"
                              value={member.role}
                              disabled={updateRole.isPending}
                              onChange={(e) =>
                                void updateRole.mutateAsync({
                                  profileId: member.id,
                                  role: e.target.value as UserRole,
                                })
                              }
                            >
                              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                              <option value={UserRole.VISTORIADOR}>Vistoriador</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-2">{formatDate(member.created_at)}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {member.id === currentProfile?.id ? "Você" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireRole>
  );
}
