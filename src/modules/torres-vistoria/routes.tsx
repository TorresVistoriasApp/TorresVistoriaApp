import { ROUTE_PATTERNS, ROUTE_SLUGS, ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";
import { InspectionLayout } from "@/modules/torres-vistoria/layouts/inspection-layout";

export const torresVistoriaRoutes: ModuleRoutes = {
  public: [
    {
      path: ROUTE_PATTERNS.validateReport,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/validate-report-page"),
        "ValidateReportPage",
      ),
    },
  ],
  client: [
    {
      path: ROUTES.dashboard,
      element: lazyRoute(() => import("@/modules/torres-vistoria/pages/dashboard-page"), "DashboardPage"),
    },
    {
      path: ROUTES.inspections,
      element: lazyRoute(() => import("@/modules/torres-vistoria/pages/inspections-page"), "InspectionsPage"),
    },
    {
      path: ROUTES.inspectionNew,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/inspection-new-page"),
        "InspectionNewPage",
      ),
    },
    {
      path: `${ROUTE_SLUGS.inspections}/:id`,
      element: <InspectionLayout />,
      children: [
        {
          index: true,
          element: lazyRoute(
            () => import("@/modules/torres-vistoria/pages/inspection-detail-page"),
            "InspectionDetailPage",
          ),
        },
        {
          path: ROUTE_SLUGS.edit,
          element: lazyRoute(
            () => import("@/modules/torres-vistoria/pages/inspection-edit-page"),
            "InspectionEditPage",
          ),
        },
        {
          path: ROUTE_SLUGS.photos,
          element: lazyRoute(
            () => import("@/modules/torres-vistoria/pages/inspection-photos-page"),
            "InspectionPhotosPage",
          ),
        },
        {
          path: ROUTE_SLUGS.checklist,
          element: lazyRoute(
            () => import("@/modules/torres-vistoria/pages/inspection-checklist-page"),
            "InspectionChecklistPage",
          ),
        },
        {
          path: ROUTE_SLUGS.report,
          element: lazyRoute(
            () => import("@/modules/torres-vistoria/pages/inspection-report-page"),
            "InspectionReportPage",
          ),
        },
      ],
    },
    {
      path: ROUTES.financial,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/financial-page"),
        "FinancialPage",
        { anyOf: ["financial.manage", "financial.read.own"] },
      ),
    },
    {
      path: ROUTES.financialRevenue,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/financial-revenue-page"),
        "FinancialRevenuePage",
        { permission: "financial.manage" },
      ),
    },
    {
      path: ROUTES.financialExpenses,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/financial-expenses-page"),
        "FinancialExpensesPage",
        { permission: "financial.manage" },
      ),
    },
    {
      path: ROUTES.reports,
      element: lazyRoute(
        () => import("@/modules/torres-vistoria/pages/reports-page"),
        "ReportsPage",
        { permission: "reports.export" },
      ),
    },
  ],
};
