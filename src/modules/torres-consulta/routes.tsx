import { Navigate } from "react-router-dom";
import { ROUTE_PATTERNS, ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";

export const torresConsultaRoutes: ModuleRoutes = {
  client: [
    { path: ROUTES.consulta, element: <Navigate to={ROUTES.consultaNew} replace /> },
    {
      path: ROUTES.consultaNew,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/consulta-new-page"),
        "ConsultaNewPage",
        { permission: "consulta.create" },
      ),
    },
    {
      path: ROUTES.consultaHistory,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/consulta-history-page"),
        "ConsultaHistoryPage",
        { anyOf: ["consulta.read.all", "consulta.read.own"] },
      ),
    },
    {
      path: ROUTES.consultaCredits,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/consulta-credits-page"),
        "ConsultaCreditsPage",
        { anyOf: ["consulta.read.all", "consulta.read.own"] },
      ),
    },
    {
      path: ROUTE_PATTERNS.consultaDetail,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/consulta-detail-page"),
        "ConsultaDetailPage",
        { anyOf: ["consulta.read.all", "consulta.read.own"] },
      ),
    },
  ],
};
