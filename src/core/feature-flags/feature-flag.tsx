import type { ReactNode } from "react";
import { useFeatureFlag } from "@/core/feature-flags/use-feature-flag";
import type { FeatureFlag, FeatureFlagContext } from "@/core/feature-flags/types";

/**
 * Renderiza `children` só quando a flag está ligada; caso contrário, `fallback`.
 */
export function FeatureFlagGate({
  flag,
  ctx,
  fallback = null,
  children,
}: {
  flag: FeatureFlag;
  ctx?: FeatureFlagContext;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const enabled = useFeatureFlag(flag, ctx);
  return <>{enabled ? children : fallback}</>;
}
