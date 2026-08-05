import { db } from "@/infra/supabase/client";
import { queries } from "@/infra/supabase/queries";
import { AppError, getErrorMessage, throwIfError } from "@/core/errors/app-error";
import { compressToWebP } from "@/shared/lib/compress-image";
import { COMPANY_ASSETS_BUCKET } from "@/infra/storage/buckets";
import { getSignedUrl, resolveStorageUrl, extractStoragePath } from "@/infra/storage/signed-url";
import { buildCompanyAddress, buildCompanyLocation } from "@/core/tenant/company-address";
import type { CompanyInput, SettingsInput } from "@/core/tenant/schemas/company";

export type Company = {
  id: string;
  trade_name: string;
  legal_name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  subscription_plan: string;
  status: string;
  location: string | null;
  address: string | null;
  address_cep: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
};

export type CompanySettings = {
  id: string;
  tenant_id: string;
  theme_mode: string;
  legal_footer: string | null;
  signature_image_url: string | null;
  watermark_enabled: boolean;
};

export const companyService = {
  async getCompany(tenantId: string): Promise<Company> {
    try {
      const company = throwIfError(
        await queries.companies.byId(tenantId),
        "Empresa não encontrada",
      ) as Company;
      company.logo_url = await resolveStorageUrl(COMPANY_ASSETS_BUCKET, company.logo_url);
      return company;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateCompany(tenantId: string, input: CompanyInput): Promise<Company> {
    try {
      const { data, error } = await db
        .from("companies")
        .update({
          trade_name: input.trade_name,
          legal_name: input.legal_name || null,
          document: input.document || null,
          primary_color: input.primary_color,
          secondary_color: input.secondary_color,
          address_cep: input.address_cep || null,
          address_street: input.address_street || null,
          address_number: input.address_number || null,
          address_complement: input.address_complement || null,
          address_neighborhood: input.address_neighborhood || null,
          address_city: input.address_city || null,
          address_state: input.address_state?.toUpperCase() || null,
          location: buildCompanyLocation(input),
          address: buildCompanyAddress(input),
        })
        .eq("id", tenantId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Company;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getSettings(tenantId: string): Promise<CompanySettings | null> {
    try {
      const { data, error } = await queries.companies.settings(tenantId);
      if (error) throw error;
      if (!data) return null;
      const settings = data as CompanySettings;
      settings.signature_image_url = await resolveStorageUrl(
        COMPANY_ASSETS_BUCKET,
        settings.signature_image_url,
      );
      return settings;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateSettings(tenantId: string, input: SettingsInput): Promise<CompanySettings> {
    try {
      const signaturePath =
        extractStoragePath(input.signature_image_url || null, COMPANY_ASSETS_BUCKET) ??
        (input.signature_image_url?.startsWith("http") ? null : input.signature_image_url || null);

      const payload = {
        theme_mode: input.theme_mode,
        legal_footer: input.legal_footer ?? null,
        signature_image_url: signaturePath,
        watermark_enabled: input.watermark_enabled,
      };

      const existing = await companyService.getSettings(tenantId);
      if (existing) {
        const { data, error } = await db
          .from("settings")
          .update(payload)
          .eq("tenant_id", tenantId)
          .select("*")
          .single();
        if (error) throw error;
        return data as CompanySettings;
      }

      const { data, error } = await db
        .from("settings")
        .insert({ tenant_id: tenantId, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as CompanySettings;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async uploadAsset(
    tenantId: string,
    file: File,
    kind: "logo" | "signature",
  ): Promise<string> {
    try {
      const compressed = await compressToWebP(file);
      const path = `${tenantId}/${kind}.webp`;
      const { error: uploadError } = await db.storage
        .from(COMPANY_ASSETS_BUCKET)
        .upload(path, compressed, { upsert: true, contentType: "image/webp" });
      if (uploadError) throw uploadError;

      if (kind === "logo") {
        await db.from("companies").update({ logo_url: path }).eq("id", tenantId);
      } else {
        const settings = await companyService.getSettings(tenantId);
        if (settings) {
          await db
            .from("settings")
            .update({ signature_image_url: path })
            .eq("tenant_id", tenantId);
        } else {
          await db.from("settings").insert({
            tenant_id: tenantId,
            signature_image_url: path,
          });
        }
      }

      return (await getSignedUrl(COMPANY_ASSETS_BUCKET, path)) ?? path;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
