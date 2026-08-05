import {
  DEFAULT_FLAGS,
  envOverride,
  runtimeOverride,
} from "@/core/feature-flags/flag-registry";
import type { FeatureFlag, FeatureFlagContext, FlagSource } from "@/core/feature-flags/types";

export type FlagResolution = {
  enabled: boolean;
  source: FlagSource;
};

/**
 * Resolve se uma flag está ligada.
 *
 * Ordem: override runtime → env → default. O contexto (tenant/plano) está na
 * assinatura para o dia em que flags forem por tenant; hoje o default não o usa.
 */
export function resolveFlag(
  flag: FeatureFlag,
  _ctx?: FeatureFlagContext,
): FlagResolution {
  const runtime = runtimeOverride(flag);
  if (runtime !== undefined) {
    return { enabled: runtime, source: "override" };
  }

  const fromEnv = envOverride(flag);
  if (fromEnv !== undefined) {
    return { enabled: fromEnv, source: "env" };
  }

  return { enabled: DEFAULT_FLAGS[flag], source: "default" };
}

export function isEnabled(flag: FeatureFlag, ctx?: FeatureFlagContext): boolean {
  return resolveFlag(flag, ctx).enabled;
}

export const featureFlags = {
  isEnabled,
  resolve: resolveFlag,
};
