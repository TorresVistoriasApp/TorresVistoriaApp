import { buildCompanyAddress, companyToAddressInput } from "@/lib/cep";
import type { Company } from "@/services/company-service";
import type { LaudoCompany, LaudoInspector } from "@/lib/laudo/laudo-model";

export type LaudoProfile = {
  full_name?: string | null;
  role?: string | null;
};

export function companyToLaudoCompany(company: Company | null | undefined): LaudoCompany | null {
  if (!company) return null;

  const structuredAddress = buildCompanyAddress({
    name: company.name,
    document: company.document ?? "",
    ...companyToAddressInput(company),
  });

  return {
    name: company.name,
    document: company.document,
    phone: company.phone,
    email: company.email,
    logo_url: company.logo_url,
    address: structuredAddress || company.address,
  };
}

export function inspectorToLaudoInspector(
  inspector: LaudoProfile | null | undefined,
): LaudoInspector | null {
  if (!inspector?.full_name) return null;

  return {
    full_name: inspector.full_name,
  };
}
