import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

const EDGE = "supabase/functions/inspector-registrations/index.ts";

describe("inspector-registrations list — isolamento de tenant", () => {
  const edge = readRepo(EDGE);
  const listBlock = edge.slice(edge.indexOf('if (action === "list")'), edge.indexOf('if (action === "approve")'));

  it("listagem do SUPER_ADMIN filtra no banco pelo tenant do JWT", () => {
    expect(listBlock).toContain("lockedTenantId");
    expect(listBlock).toContain('companiesQuery.eq("id", lockedTenantId)');
    expect(listBlock).toContain('.eq("document_type", "cnpj")');
    expect(listBlock).toContain('.in("document_hash", [...allowedHashes])');
  });

  it("tenant enviado no payload não amplia o escopo da listagem", () => {
    expect(listBlock).not.toMatch(/body\.tenantId|body\.tenant_id/);
    expect(listBlock).toContain("Tenant no payload do cliente não amplia");
  });

  it("PLATFORM_ADMIN (lock nulo) continua listando sem filtro de empresa", () => {
    expect(listBlock).toContain("if (lockedTenantId)");
    expect(edge).toContain("requireRegistrationApprover");
  });

  it("recusa no tenant travado também exige match de documento", () => {
    const rejectBlock = edge.slice(edge.indexOf('if (action === "reject")'));
    expect(rejectBlock).toContain("pendingRegistrationMatchesLockedTenant");
    expect(rejectBlock).toContain("lockedTenantId");
  });
});
