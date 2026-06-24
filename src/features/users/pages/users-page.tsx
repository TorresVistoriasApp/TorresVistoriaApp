import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  CreateUserDialog,
  EditUserDialog,
  UserCard,
  useCreateUser,
  useSetUserActive,
  useUpdateUser,
} from "@/features/users";
import { useTeamProfiles } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import type { TeamProfile } from "@/services/user-service";

type RoleFilter = "all" | (typeof UserRole)[keyof typeof UserRole];
type SortOption = "name-asc" | "name-desc" | "date-desc" | "date-asc";

const PAGE_SIZE = 10;

const ROLE_TABS: Array<{ id: RoleFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: UserRole.SUPER_ADMIN, label: "Super Admins" },
  { id: UserRole.VISTORIADOR, label: "Vistoriadores" },
];

export function UsersPage() {
  const { profile: currentProfile } = useAuth();
  const { data: team = [], isLoading } = useTeamProfiles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const setUserActive = useSetUserActive();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<TeamProfile | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const filteredTeam = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return team
      .filter((member) => {
        if (roleFilter !== "all" && member.role !== roleFilter) return false;
        if (!normalizedSearch) return true;
        return (
          member.full_name.toLowerCase().includes(normalizedSearch) ||
          (member.email ?? "").toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-desc":
            return b.full_name.localeCompare(a.full_name, "pt-BR");
          case "date-desc":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "date-asc":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          default:
            return a.full_name.localeCompare(b.full_name, "pt-BR");
        }
      });
  }, [team, roleFilter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTeam.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedTeam = filteredTeam.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleCreate = async (data: Parameters<typeof createUser.mutateAsync>[0]) => {
    await createUser.mutateAsync(data);
    toast({ title: USER_MESSAGES.createSuccess, type: "success" });
    setPage(1);
  };

  const handleUpdate = async (userId: string, data: Parameters<typeof updateUser.mutateAsync>[0]["input"]) => {
    try {
      await updateUser.mutateAsync({ userId, input: data });
      toast({ title: USER_MESSAGES.updateSuccess, type: "success" });
    } catch (err) {
      toast({
        title: USER_MESSAGES.updateFailed,
        description: formatUserFacingError(err instanceof Error ? err.message : ""),
        type: "error",
      });
      throw err;
    }
  };

  const handleToggleActive = async (user: TeamProfile) => {
    setTogglingUserId(user.id);
    try {
      await setUserActive.mutateAsync({ userId: user.id, isActive: !user.is_active });
      toast({
        title: user.is_active ? USER_MESSAGES.deactivateSuccess : USER_MESSAGES.reactivateSuccess,
        type: "success",
      });
    } catch (err) {
      toast({
        title: USER_MESSAGES.statusFailed,
        description: formatUserFacingError(err instanceof Error ? err.message : ""),
        type: "error",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link
              to={ROUTES.settings}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Contas da plataforma: Super Admins e vistoriadores. Cadastre senhas iniciais e gerencie acesso,
                nome e e-mail de cada usuário.
              </p>
            </div>
          </div>

          <Button className="touch-target shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        </div>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-5">
          <div className="flex flex-wrap gap-2">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setRoleFilter(tab.id);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  roleFilter === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nome ou email..."
                className="touch-target pl-10"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="flex h-11 min-w-[180px] touch-target rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="name-asc">Ordenar Nome (A-Z)</option>
                <option value="name-desc">Ordenar Nome (Z-A)</option>
                <option value="date-desc">Mais recentes</option>
                <option value="date-asc">Mais antigos</option>
              </select>

              <select
                value={PAGE_SIZE}
                disabled
                className="flex h-11 min-w-[120px] touch-target rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value={PAGE_SIZE}>Itens {PAGE_SIZE}</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : paginatedTeam.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedTeam.map((member) => (
              <UserCard
                key={member.id}
                user={member}
                isCurrentUser={member.id === currentProfile?.id}
                onEdit={setEditUser}
                onToggleActive={handleToggleActive}
                isToggling={togglingUserId === member.id}
              />
            ))}
          </div>
        )}

        {filteredTeam.length > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Anterior
            </Button>
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary/10 px-3 text-sm font-semibold text-primary">
              {currentPage}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onSubmit={handleUpdate}
        isSubmitting={updateUser.isPending}
      />
    </RequireRole>
  );
}
