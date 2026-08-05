import { describe, expect, it } from "vitest";
import {
  computeAuditStats,
  getAuditMetadataEntries,
  getAuditSummary,
} from "@/modules/admin/audit/utils/audit-presentation";
import { isAppAuditAction } from "@/core/audit/audit-actions";
import type { AuditLog } from "@/core/audit/audit-service";

function makeLog(overrides: Partial<AuditLog>): AuditLog {
  return {
    id: "log-1",
    tenant_id: "company-1",
    user_id: "user-1",
    action: "INSERT",
    entity_type: "inspections",
    entity_id: "insp-1",
    old_data: null,
    new_data: null,
    ip_address: null,
    user_agent: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("audit-utils", () => {
  it("identifica ações de aplicação", () => {
    expect(isAppAuditAction("LOGIN")).toBe(true);
    expect(isAppAuditAction("EXPORT_PDF")).toBe(true);
    expect(isAppAuditAction("INSERT")).toBe(false);
  });

  it("resume eventos de exportação", () => {
    const summary = getAuditSummary(
      makeLog({
        action: "EXPORT_PDF",
        entity_type: "export",
        new_data: { filename: "relatorio.pdf", title: "Relatório financeiro" },
      }),
    );
    expect(summary).toContain("Relatório financeiro");
  });

  it("extrai metadados de eventos de app", () => {
    const entries = getAuditMetadataEntries({
      filename: "auditoria.xlsx",
      rowCount: 12,
    });
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Arquivo", value: "auditoria.xlsx" }),
        expect.objectContaining({ label: "Linhas exportadas", value: "12" }),
      ]),
    );
  });

  it("contabiliza logins e exportações", () => {
    const stats = computeAuditStats([
      makeLog({ action: "LOGIN" }),
      makeLog({ action: "EXPORT_EXCEL" }),
      makeLog({ action: "UPDATE" }),
    ]);
    expect(stats.logins).toBe(1);
    expect(stats.exports).toBe(1);
    expect(stats.updates).toBe(1);
  });
});
