import { describe, expect, it } from "vitest";
import { UserRole } from "@/core/rbac/roles";
import { queryKeys } from "@/infra/supabase/queries";
import {
  canAccessAuditLog,
  canAccessFinancialRow,
  canAccessTenantRow,
  filterVisibleProfiles,
  isCrossTenantStoragePath,
  storagePathBelongsToTenant,
  type TenantSession,
} from "@/core/tenant/tenant-policy";

const COMPANY_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const COMPANY_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const SUPER_ADMIN_A: TenantSession = {
  userId: "11111111-1111-4111-8111-111111111111",
  tenantId: COMPANY_A,
  role: UserRole.SUPER_ADMIN,
};

const SUPER_ADMIN_B: TenantSession = {
  userId: "22222222-2222-4222-8222-222222222222",
  tenantId: COMPANY_B,
  role: UserRole.SUPER_ADMIN,
};

const INSPECTOR_A: TenantSession = {
  userId: "33333333-3333-4333-8333-333333333333",
  tenantId: COMPANY_A,
  role: UserRole.INSPECTOR,
};

const INSPECTOR_B: TenantSession = {
  userId: "44444444-4444-4444-8444-444444444444",
  tenantId: COMPANY_A,
  role: UserRole.INSPECTOR,
};

const INSPECTION_A = "95968fbc-36d7-4e21-a4ad-dabc9390c390";

describe("tenant isolation — empresas", () => {
  it("Super Admin A não acessa registros da Empresa B", () => {
    const row = { tenantId: COMPANY_B, createdBy: SUPER_ADMIN_B.userId };
    expect(canAccessTenantRow(SUPER_ADMIN_A, row)).toBe(false);
  });

  it("Inspector A não acessa registros da Empresa B", () => {
    const row = { tenantId: COMPANY_B, createdBy: INSPECTOR_B.userId };
    expect(canAccessTenantRow(INSPECTOR_A, row)).toBe(false);
  });
});

const SUPER_ADMIN_A2: TenantSession = {
  userId: "55555555-5555-4555-8555-555555555555",
  tenantId: COMPANY_A,
  role: UserRole.SUPER_ADMIN,
};

describe("tenant isolation — super admins na mesma empresa", () => {
  const rowByAdminA2 = { tenantId: COMPANY_A, createdBy: SUPER_ADMIN_A2.userId };

  it("Super Admin A vê registros de outro Super Admin na mesma empresa", () => {
    expect(canAccessTenantRow(SUPER_ADMIN_A, rowByAdminA2)).toBe(true);
  });
});

describe("tenant isolation — inspetores na mesma empresa", () => {
  const rowByInspectorB = { tenantId: COMPANY_A, createdBy: INSPECTOR_B.userId };

  it("Inspector A não vê vistorias criadas pelo Inspector B", () => {
    expect(canAccessTenantRow(INSPECTOR_A, rowByInspectorB)).toBe(false);
  });

  it("Inspector A vê apenas os próprios registros", () => {
    const ownRow = { tenantId: COMPANY_A, createdBy: INSPECTOR_A.userId };
    expect(canAccessTenantRow(INSPECTOR_A, ownRow)).toBe(true);
  });

  it("Super Admin A vê registros de qualquer inspetor da empresa", () => {
    const rowByInspectorB = { tenantId: COMPANY_A, createdBy: INSPECTOR_B.userId };
    expect(canAccessTenantRow(SUPER_ADMIN_A, rowByInspectorB)).toBe(true);
  });
});

describe("tenant isolation — financeiro", () => {
  it("Inspector A não vê lançamento do Inspector B sem vínculo", () => {
    expect(
      canAccessFinancialRow(INSPECTOR_A, {
        tenantId: COMPANY_A,
        createdBy: INSPECTOR_B.userId,
        inspectionId: null,
      }),
    ).toBe(false);
  });

  it("Inspector A vê lançamento de vistoria que ele criou", () => {
    expect(
      canAccessFinancialRow(INSPECTOR_A, {
        tenantId: COMPANY_A,
        createdBy: SUPER_ADMIN_A.userId,
        inspectionId: INSPECTION_A,
        inspectionCreatedBy: INSPECTOR_A.userId,
      }),
    ).toBe(true);
  });

  it("Super Admin A vê todo financeiro da empresa", () => {
    expect(
      canAccessFinancialRow(SUPER_ADMIN_A, {
        tenantId: COMPANY_A,
        createdBy: INSPECTOR_B.userId,
        inspectionId: INSPECTION_A,
      }),
    ).toBe(true);
  });

  it("Super Admin A não vê financeiro da Empresa B", () => {
    expect(
      canAccessFinancialRow(SUPER_ADMIN_A, {
        tenantId: COMPANY_B,
        createdBy: INSPECTOR_B.userId,
        inspectionId: null,
      }),
    ).toBe(false);
  });
});

describe("tenant isolation — auditoria", () => {
  it("Inspector não acessa logs de auditoria", () => {
    expect(canAccessAuditLog(INSPECTOR_A, COMPANY_A)).toBe(false);
  });

  it("Super Admin A acessa auditoria da própria empresa", () => {
    expect(canAccessAuditLog(SUPER_ADMIN_A, COMPANY_A)).toBe(true);
  });

  it("Super Admin A não acessa auditoria da Empresa B", () => {
    expect(canAccessAuditLog(SUPER_ADMIN_A, COMPANY_B)).toBe(false);
  });
});

describe("tenant isolation — perfis / usuários", () => {
  const profiles = [
    { id: SUPER_ADMIN_A.userId, tenantId: COMPANY_A },
    { id: INSPECTOR_A.userId, tenantId: COMPANY_A },
    { id: INSPECTOR_B.userId, tenantId: COMPANY_A },
    { id: SUPER_ADMIN_B.userId, tenantId: COMPANY_B },
  ];

  it("Super Admin A vê equipe da Empresa A, não da B", () => {
    const visible = filterVisibleProfiles(SUPER_ADMIN_A, profiles);
    expect(visible.map((p) => p.id)).toEqual([
      SUPER_ADMIN_A.userId,
      INSPECTOR_A.userId,
      INSPECTOR_B.userId,
    ]);
  });

  it("Super Admin A não visualiza Super Admin B (outra empresa)", () => {
    const visible = filterVisibleProfiles(SUPER_ADMIN_A, profiles);
    expect(visible.some((p) => p.id === SUPER_ADMIN_B.userId)).toBe(false);
  });

  it("Inspector A não visualiza Inspector B", () => {
    const visible = filterVisibleProfiles(INSPECTOR_A, profiles);
    expect(visible.map((p) => p.id)).toEqual([INSPECTOR_A.userId]);
  });
});

describe("tenant isolation — storage (fotos e PDF)", () => {
  const photoA = `${COMPANY_A}/${INSPECTION_A}/EXT_FRENTE/foto.webp`;
  const photoB = `${COMPANY_B}/${INSPECTION_A}/EXT_FRENTE/foto.webp`;
  const pdfA = `${COMPANY_A}/${INSPECTION_A}/laudo.pdf`;

  it("foto pertence à Empresa A", () => {
    expect(storagePathBelongsToTenant(photoA, COMPANY_A)).toBe(true);
  });

  it("foto da Empresa B é cross-tenant para Empresa A", () => {
    expect(isCrossTenantStoragePath(photoB, COMPANY_A)).toBe(true);
  });

  it("PDF segue prefixo tenant_id", () => {
    expect(storagePathBelongsToTenant(pdfA, COMPANY_A)).toBe(true);
    expect(isCrossTenantStoragePath(pdfA, COMPANY_B)).toBe(true);
  });
});

describe("tenant isolation — cache React Query", () => {
  it("query keys de listagens diferem por tenantId", () => {
    const keyA = queryKeys.inspections.list(COMPANY_A, { status: "DRAFT" });
    const keyB = queryKeys.inspections.list(COMPANY_B, { status: "DRAFT" });
    expect(keyA).not.toEqual(keyB);
  });

  it("query keys de dashboard, financeiro, auditoria e equipe incluem tenantId", () => {
    expect(queryKeys.dashboard.metrics(COMPANY_A)).toContain(COMPANY_A);
    expect(queryKeys.financial.summary(COMPANY_A)).toContain(COMPANY_A);
    expect(queryKeys.audit.list(COMPANY_A)).toContain(COMPANY_A);
    expect(queryKeys.users.team(COMPANY_A)).toContain(COMPANY_A);
  });
});
