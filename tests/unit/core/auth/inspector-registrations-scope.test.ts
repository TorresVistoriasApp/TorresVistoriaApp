import { describe, expect, it } from "vitest";
import { pendingRegistrationMatchesLockedTenant } from "../../../../supabase/functions/_shared/inspector-document-hash";

describe("Listagem de cadastros — escopo do SUPER_ADMIN", () => {
  const tenantAHash = "hash-tenant-a";
  const tenantBHash = "hash-tenant-b";
  const allowedA = new Set([tenantAHash]);

  it("SUPER_ADMIN Tenant A só vê CNPJ cujo hash é da empresa A", () => {
    expect(
      pendingRegistrationMatchesLockedTenant(
        { document_type: "cnpj", document_hash: tenantAHash },
        allowedA,
      ),
    ).toBe(true);
    expect(
      pendingRegistrationMatchesLockedTenant(
        { document_type: "cnpj", document_hash: tenantBHash },
        allowedA,
      ),
    ).toBe(false);
  });

  it("CPF e hash vazio não entram no escopo do tenant travado", () => {
    expect(
      pendingRegistrationMatchesLockedTenant(
        { document_type: "cpf", document_hash: tenantAHash },
        allowedA,
      ),
    ).toBe(false);
    expect(
      pendingRegistrationMatchesLockedTenant({ document_type: "cnpj", document_hash: "" }, allowedA),
    ).toBe(false);
  });
});
