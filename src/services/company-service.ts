import { supabase } from "@/lib/supabase";
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
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .is("deleted_at", null)
      .single();
    if (error) throw error;
    return data as Company;
  },

  async updateCompany(companyId: string, input: CompanyInput): Promise<Company> {
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
  },

  async getSettings(companyId: string): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    return data as CompanySettings | null;
  },

  async updateSettings(companyId: string, input: SettingsInput): Promise<CompanySettings> {
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
  },

  async uploadAsset(
    companyId: string,
    file: File,
    kind: "logo" | "signature",
  ): Promise<string> {
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
  },
};
