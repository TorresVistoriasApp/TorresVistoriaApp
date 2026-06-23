import { supabase } from "@/lib/supabase";
import { queries } from "@/lib/queries";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
import { compressToWebP } from "@/lib/compress-image";
import type { CompanyInput, SettingsInput } from "@/schemas/settings";

export type Company = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
};

export type CompanySettings = {
  id: string;
  company_id: string;
  primary_color: string;
  theme_mode: string;
  legal_footer: string | null;
  signature_image_url: string | null;
  watermark_enabled: boolean;
};

export const companyService = {
  async getCompany(companyId: string): Promise<Company> {
    try {
      return throwIfError(await queries.companies.byId(companyId), "Empresa não encontrada");
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateCompany(companyId: string, input: CompanyInput): Promise<Company> {
    try {
      const { data, error } = await supabase
        .from("companies")
        .update({
          name: input.name,
          document: input.document ?? null,
          email: input.email || null,
          phone: input.phone ?? null,
        })
        .eq("id", companyId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Company;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getSettings(companyId: string): Promise<CompanySettings | null> {
    try {
      const { data, error } = await queries.companies.settings(companyId);
      if (error) throw error;
      return data as CompanySettings | null;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateSettings(companyId: string, input: SettingsInput): Promise<CompanySettings> {
    try {
      const payload = {
        primary_color: input.primary_color,
        theme_mode: input.theme_mode,
        legal_footer: input.legal_footer ?? null,
        signature_image_url: input.signature_image_url || null,
        watermark_enabled: input.watermark_enabled,
      };

      const existing = await companyService.getSettings(companyId);
      if (existing) {
        const { data, error } = await supabase
          .from("settings")
          .update(payload)
          .eq("company_id", companyId)
          .select("*")
          .single();
        if (error) throw error;
        return data as CompanySettings;
      }

      const { data, error } = await supabase
        .from("settings")
        .insert({ company_id: companyId, ...payload })
        .select("*")
        .single();
      if (error) throw error;
      return data as CompanySettings;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async uploadAsset(
    companyId: string,
    file: File,
    kind: "logo" | "signature",
  ): Promise<string> {
    try {
      const compressed = await compressToWebP(file);
      const path = `${companyId}/${kind}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(path, compressed, { upsert: true, contentType: "image/webp" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("company-assets").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      if (kind === "logo") {
        await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", companyId);
      } else {
        const settings = await companyService.getSettings(companyId);
        if (settings) {
          await supabase
            .from("settings")
            .update({ signature_image_url: publicUrl })
            .eq("company_id", companyId);
        } else {
          await supabase.from("settings").insert({
            company_id: companyId,
            signature_image_url: publicUrl,
          });
        }
      }

      return publicUrl;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
