export const FEATURE_FLAGS = [
  "torres-consulta",
  "torres-consulta.official-api",
  "torres-vistoria",
  "payments",
  "cashback",
  "coupons",
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

export type FeatureFlagContext = {
  tenantId?: string | null;
  plan?: string | null;
  userId?: string | null;
};

export type FlagSource = "default" | "env" | "override";
