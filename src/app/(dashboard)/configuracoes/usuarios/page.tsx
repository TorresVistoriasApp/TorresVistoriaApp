import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { UserForm } from "@/components/forms/user-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DataTable } from "@/components/shared/data-table";
import { useTeamProfiles, useUpdateUserRole, useInviteUser } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";
import type { TeamProfile } from "@/services/user-service";

export function Page() {
  const { profile: currentProfile } = useAuth();
  const { data: team = [], isLoading } = useTeamProfiles();
  const updateRole = useUpdateUserRole();
  const inviteUser = useInviteUser();
  const { toast } = useToast();

  const handleInvite = async (data: Parameters<typeof inviteUser.mutateAsync>[0]) => {
    try {
      await inviteUser.mutateAsync(data);
      toast("Convite enviado por e-mail");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao convidar usuário");
    }
  };

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Usuários</h1>

        <Card>
          <CardHeader>
            <CardTitle>Convidar novo usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm onSubmit={handleInvite} isSubmitting={inviteUser.isPending} />
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
              <DataTable<TeamProfile>
                columns={[
                  { key: "full_name", header: "Nome", render: (m) => m.full_name },
                  {
                    key: "role",
                    header: "Função",
                    render: (member) =>
                      member.id === currentProfile?.id ? (
                        member.role
                      ) : (
                        <select
                          className="touch-target rounded border border-input bg-background px-2 py-1 text-sm"
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
                      ),
                  },
                  {
                    key: "created_at",
                    header: "Desde",
                    render: (m) => formatDate(m.created_at),
                  },
                  {
                    key: "id",
                    header: "Ações",
                    render: (m) => (m.id === currentProfile?.id ? "Você" : "—"),
                  },
                ]}
                rows={team}
                rowKey={(m) => m.id}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </RequireRole>
  );
}
