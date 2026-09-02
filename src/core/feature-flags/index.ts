export { FEATURE_FLAGS, type FeatureFlag, type FeatureFlagContext, type FlagSource } from "@/core/feature-flags/types";
export { featureFlags, isEnabled, resolveFlag, type FlagResolution } from "@/core/feature-flags/flag-service";
export {
  DEFAULT_FLAGS,
  setFlagOverride,
  clearFlagOverrides,
} from "@/core/feature-flags/flag-registry";
export { useFeatureFlag, useFeatureFlagResolution } from "@/core/feature-flags/use-feature-flag";
export { FeatureFlagGate } from "@/core/feature-flags/feature-flag";
