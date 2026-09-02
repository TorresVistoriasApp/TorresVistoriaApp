import { registerIntegration } from "@/core/integrations/registry";
import { supabaseFileStorage } from "@/infra/integrations/storage";

export function bootstrapIntegrations(): void {
  registerIntegration("storage", supabaseFileStorage);
}
