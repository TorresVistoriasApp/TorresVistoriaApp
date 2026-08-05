import { Navigate } from "react-router-dom";
import { ROUTE_PATTERNS, ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";
import { ClienteLayout } from "@/modules/torres-consulta/layouts/cliente-layout";

export const torresConsultaRoutes: ModuleRoutes = {
  marketing: [
    {
      path: ROUTES.consultaLanding,
      element: lazyRoute(() => import("@/modules/torres-consulta/pages/landing-page"), "LandingPage"),
    },
  ],

  public: [
    {
      path: ROUTES.termos,
      element: lazyRoute(() => import("@/modules/torres-consulta/pages/legal/termos-page"), "TermosPage"),
    },
    {
      path: ROUTES.lgpd,
      element: lazyRoute(() => import("@/modules/torres-consulta/pages/legal/lgpd-page"), "LgpdPage"),
    },
    {
      path: ROUTES.faq,
      element: lazyRoute(() => import("@/modules/torres-consulta/pages/legal/faq-page"), "FaqPage"),
    },
  ],

  auth: [
    { path: ROUTES.cliente, element: <Navigate to={ROUTES.clienteLogin} replace /> },
    {
      path: ROUTES.clienteLogin,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/cliente/login-page"),
        "ClienteLoginPage",
      ),
    },
    {
      path: ROUTES.clienteRegister,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/cliente/register-page"),
        "ClienteRegisterPage",
      ),
    },
    {
      path: ROUTES.clienteForgotPassword,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/cliente/forgot-password-page"),
        "ClienteForgotPasswordPage",
      ),
    },
    {
      path: ROUTES.clienteResetPassword,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/cliente/reset-password-page"),
        "ClienteResetPasswordPage",
      ),
    },
  ],

  consumer: [
    {
      element: <ClienteLayout />,
      children: [
        {
          path: ROUTES.clienteDashboard,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/dashboard-page"),
            "ClienteDashboardPage",
          ),
        },
        {
          path: ROUTES.clienteProfile,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/profile-page"),
            "ClienteProfilePage",
          ),
        },
        {
          path: ROUTES.clienteConsultas,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/consultas-page"),
            "ClienteConsultasPage",
          ),
        },
        {
          path: ROUTES.clienteSettings,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/settings-page"),
            "ClienteSettingsPage",
          ),
        },
      ],
    },
  ],

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
