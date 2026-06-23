import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuditLogs } from "@/hooks/use-audit";
import { formatDate } from "@/lib/formatters";

export function Page() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Auditoria</h1>
        <Card>
          <CardHeader>
            <CardTitle>Registro de alterações</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left">Data</th>
                      <th className="px-4 py-2 text-left">Ação</th>
                      <th className="px-4 py-2 text-left">Entidade</th>
                      <th className="px-4 py-2 text-left">ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t border-border">
                        <td className="px-4 py-2 whitespace-nowrap">{formatDate(log.created_at)}</td>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2">{log.entity_type}</td>
                        <td className="px-4 py-2 font-mono text-xs">{log.entity_id?.slice(0, 8) ?? "—"}</td>
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
