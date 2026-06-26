import { useMemo, useState } from "react";
import { Activity, CalendarDays, Eye, Pencil, PlusCircle } from "lucide-react";
import { RequireRole } from "@/app/require-role";
import { UserRole } from "@/lib/enums";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButton } from "@/components/shared/export-button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DataTable } from "@/components/shared/data-table";
import { KpiCard } from "@/components/charts/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditActionBadge } from "@/features/audit/components/audit-action-badge";
import { AuditDetailDialog } from "@/features/audit/components/audit-detail-dialog";
import { AuditFiltersBar } from "@/features/audit/components/audit-filters";
import { useAuditLogs } from "@/hooks/use-audit";
import { useTeamProfiles } from "@/hooks/use-users";
import {
  computeAuditStats,
  getAuditSummary,
  getEntityLabel,
} from "@/lib/audit-utils";
import { formatDateTime, truncateText } from "@/lib/formatters";
import { exportToExcel } from "@/lib/export-excel";
import { exportToPdf } from "@/lib/export-pdf";
import type { AuditFilters, AuditLogWithUser } from "@/services/audit-service";

const PAGE_SIZE_OPTIONS = [15, 30, 50] as const;

export function AuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(15);
  const [selectedLog, setSelectedLog] = useState<AuditLogWithUser | null>(null);

  const { data: logs = [], isLoading } = useAuditLogs(filters);
  const { data: team = [] } = useTeamProfiles();

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return logs;

    return logs.filter((log) => {
      const summary = getAuditSummary(log).toLowerCase();
      const entityLabel = getEntityLabel(log.entity_type).toLowerCase();
      const userName = (log.user?.full_name ?? "").toLowerCase();
      const entityId = (log.entity_id ?? "").toLowerCase();

      return (
        summary.includes(normalizedSearch) ||
        entityLabel.includes(normalizedSearch) ||
        userName.includes(normalizedSearch) ||
        entityId.includes(normalizedSearch)
      );
    });
  }, [logs, search]);

  const stats = useMemo(() => computeAuditStats(filteredLogs), [filteredLogs]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleFiltersChange = (next: AuditFilters) => {
    setFilters(next);
    setPage(1);
  };

  const exportRows = filteredLogs.map((log) => ({
    data: formatDateTime(log.created_at),
    usuario: log.user?.full_name ?? "Sistema",
    acao: log.action,
    entidade: getEntityLabel(log.entity_type),
    resumo: getAuditSummary(log),
    id: log.entity_id ?? "",
  }));

  const exportPdf = async () => {
    await exportToPdf(
      exportRows,
      [
        { header: "Data", key: "data" },
        { header: "Usuário", key: "usuario" },
        { header: "Ação", key: "acao" },
        { header: "Entidade", key: "entidade" },
        { header: "Resumo", key: "resumo" },
        { header: "ID", key: "id" },
      ],
      "auditoria.pdf",
      "Registro de auditoria",
      "Governança e rastreabilidade do sistema",
    );
  };

  const exportExcel = async () => {
    await exportToExcel(
      exportRows,
      [
        { header: "Data", key: "data", width: 18 },
        { header: "Usuário", key: "usuario", width: 24 },
        { header: "Ação", key: "acao", width: 12 },
        { header: "Entidade", key: "entidade", width: 20 },
        { header: "Resumo", key: "resumo", width: 36 },
        { header: "ID", key: "id", width: 38 },
      ],
      "auditoria.xlsx",
      {
        title: "Registro de auditoria",
        subtitle: "Governança e rastreabilidade do sistema",
        sheetName: "Auditoria",
      },
    );
  };

  return (
    <RequireRole roles={[UserRole.SUPER_ADMIN]}>
      <div className="min-w-0 space-y-8">
        <PageHeader
          title="Auditoria"
          description="Governança completa: rastreie criações, alterações e exclusões em todo o sistema."
          badge="Super Admin"
          actions={
            <ExportButton
              className="w-full min-w-0 sm:w-auto"
              buttonClassName="touch-target w-full justify-center sm:w-auto sm:justify-start"
              onExportPdf={exportPdf}
              onExportExcel={exportExcel}
              disabled={filteredLogs.length === 0}
            />
          }
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            <KpiCard
              label="Total de eventos"
              value={String(stats.total)}
              icon={Activity}
              themeIndex={0}
            />
            <KpiCard
              label="Eventos hoje"
              value={String(stats.today)}
              icon={CalendarDays}
              themeIndex={1}
            />
            <KpiCard
              label="Criações"
              value={String(stats.inserts)}
              icon={PlusCircle}
              themeIndex={2}
            />
            <KpiCard
              label="Alterações"
              value={String(stats.updates)}
              icon={Pencil}
              themeIndex={3}
            />
          </div>
        )}

        <AuditFiltersBar
          filters={filters}
          search={search}
          team={team}
          onFiltersChange={handleFiltersChange}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Registro de alterações</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredLogs.length} evento{filteredLogs.length !== 1 ? "s" : ""} encontrado
                {filteredLogs.length !== 1 ? "s" : ""}
              </p>
            </div>
            {filteredLogs.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <label htmlFor="audit-page-size" className="whitespace-nowrap">
                  Exibir
                </label>
                <select
                  id="audit-page-size"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]);
                    setPage(1);
                  }}
                  className="flex h-9 min-w-[88px] touch-target rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="whitespace-nowrap">por página</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : filteredLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            ) : (
              <>
                <DataTable<AuditLogWithUser>
                  columns={[
                    {
                      key: "created_at",
                      header: "Data/Hora",
                      render: (log) => (
                        <span className="whitespace-nowrap">{formatDateTime(log.created_at)}</span>
                      ),
                    },
                    {
                      key: "user",
                      header: "Usuário",
                      render: (log) => log.user?.full_name ?? "Sistema",
                    },
                    {
                      key: "action",
                      header: "Ação",
                      render: (log) => <AuditActionBadge action={log.action} />,
                    },
                    {
                      key: "entity_type",
                      header: "Entidade",
                      render: (log) => getEntityLabel(log.entity_type),
                    },
                    {
                      key: "summary",
                      header: "Resumo",
                      render: (log) => (
                        <span className="max-w-[240px] truncate block" title={getAuditSummary(log)}>
                          {truncateText(getAuditSummary(log), 60)}
                        </span>
                      ),
                    },
                    {
                      key: "actions",
                      header: "",
                      className: "text-right w-[100px]",
                      render: (log) => (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="touch-target"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                          Detalhes
                        </Button>
                      ),
                    },
                  ]}
                  rows={paginatedLogs}
                  rowKey={(log) => log.id}
                />

                {filteredLogs.length > pageSize && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      {(currentPage - 1) * pageSize + 1}–
                      {Math.min(currentPage * pageSize, filteredLogs.length)} de{" "}
                      {filteredLogs.length} eventos
                    </p>
                    <div className="flex items-center justify-center gap-3 sm:justify-end">
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
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <AuditDetailDialog
          log={selectedLog}
          open={!!selectedLog}
          onOpenChange={(open) => {
            if (!open) setSelectedLog(null);
          }}
        />
      </div>
    </RequireRole>
  );
}

export { AuditPage as Page };
