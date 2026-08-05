import { ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";

export const complianceRoutes: ModuleRoutes = {
  public: [
    {
      path: ROUTES.privacy,
      element: lazyRoute(() => import("@/core/compliance/pages/privacy-page"), "PrivacyPage"),
    },
  ],
};
