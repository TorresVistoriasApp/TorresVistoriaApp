import { useMemo } from "react";
import { isEnabled, resolveFlag } from "@/core/feature-flags/flag-service";
import type { FeatureFlag, FeatureFlagContext } from "@/core/feature-flags/types";

export function useFeatureFlag(flag: FeatureFlag, ctx?: FeatureFlagContext): boolean {
  return useMemo(() => isEnabled(flag, ctx), [flag, ctx?.tenantId, ctx?.plan, ctx?.userId]);
}

export function useFeatureFlagResolution(flag: FeatureFlag, ctx?: FeatureFlagContext) {
  return useMemo(() => resolveFlag(flag, ctx), [flag, ctx?.tenantId, ctx?.plan, ctx?.userId]);
}
