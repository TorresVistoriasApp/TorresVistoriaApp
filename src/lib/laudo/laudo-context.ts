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
    trade_name: company.trade_name,
    legal_name: company.legal_name ?? "",
    document: company.document ?? "",
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
    ...companyToAddressInput(company),
  });

  return {
    name: company.trade_name,
    document: company.document,
    phone: company.phone,
    email: company.email,
    logo_url: company.logo_url,
    address: structuredAddress || company.address,
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
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
