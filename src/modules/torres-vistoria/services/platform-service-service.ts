import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";

export interface PlatformService {
  id: string;
  code: string;
  name: string;
  description: string | null;
  base_price: number;
  currency: string;
  includes_vehicle_consultation: boolean;
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export const platformServiceService = {
  async listActive(): Promise<PlatformService[]> {
    try {
      const { data, error } = await db
        .from("platform_services")
        .select("id, code, name, description, base_price, currency, includes_vehicle_consultation, features, is_active, sort_order")
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data ?? []) as PlatformService[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};

/** Formata o preço para exibição em PT-BR (ex.: "R$ 15,00"). */
export function formatServicePrice(price: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}
