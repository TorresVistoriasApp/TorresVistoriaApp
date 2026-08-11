import { Navigate } from "react-router-dom";
import { ROUTE_PATTERNS, ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import { ConsumerAuthRoute } from "@/routes/guards/consumer-auth-route";
import type { ModuleRoutes } from "@/routes/route-contract";
import { ClienteLayout } from "@/modules/torres-consulta/layouts/cliente-layout";
import { ConsumerAuthLayout } from "@/modules/torres-consulta/layouts/consumer-auth-layout";

const legacyAuthRedirects = [
  { path: ROUTES.cliente, element: <Navigate to={ROUTES.consultaLogin} replace /> },
  { path: ROUTES.clienteLogin, element: <Navigate to={ROUTES.consultaLogin} replace /> },
  { path: ROUTES.clienteRegister, element: <Navigate to={ROUTES.consultaRegister} replace /> },
  { path: ROUTES.clienteForgotPassword, element: <Navigate to={ROUTES.consultaForgotPassword} replace /> },
  { path: ROUTES.clienteResetPassword, element: <Navigate to={ROUTES.consultaResetPassword} replace /> },
] as const;

const legacyConsumerRedirects = [
  { path: ROUTES.clienteDashboard, element: <Navigate to={ROUTES.consultaApp} replace /> },
  { path: ROUTES.clienteConsultas, element: <Navigate to={ROUTES.consultaAppConsultas} replace /> },
  { path: ROUTES.clienteProfile, element: <Navigate to={ROUTES.consultaAppMinhaConta} replace /> },
  { path: ROUTES.clienteSettings, element: <Navigate to={ROUTES.consultaAppMinhaConta} replace /> },
] as const;

export const torresConsultaRoutes: ModuleRoutes = {
  marketing: [
    {
      path: ROUTES.consultaLanding,
      element: lazyRoute(() => import("@/modules/torres-consulta/pages/landing-page"), "LandingPage"),
    },
    { path: ROUTES.consulta, element: <Navigate to={ROUTES.consultaLanding} replace /> },
    {
      path: ROUTES.relatorioExemplo,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/sample-report-page"),
        "SampleReportPage",
      ),
    },
    {
      path: ROUTES.sobre,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/about-page"),
        "AboutPage",
      ),
    },
    {
      path: ROUTES.ajuda,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/help-page"),
        "HelpPage",
      ),
    },
    {
      path: ROUTES.contato,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/contact-page"),
        "ContactPage",
      ),
    },
    {
      path: ROUTES.comoFunciona,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/how-it-works-page"),
        "HowItWorksPage",
      ),
    },
    {
      path: ROUTES.privacy,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/privacy-page"),
        "PrivacyPage",
      ),
    },
    {
      path: ROUTES.termos,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/terms-page"),
        "TermsPage",
      ),
    },
    {
      path: ROUTES.lgpd,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/lgpd-page"),
        "LgpdPage",
      ),
    },
    {
      path: ROUTES.cookies,
      element: lazyRoute(
        () => import("@/modules/torres-consulta/pages/marketing/cookies-page"),
        "CookiesPage",
      ),
    },
    { path: ROUTES.faq, element: <Navigate to={ROUTES.ajuda} replace /> },
  ],

  auth: [
    {
      element: <ConsumerAuthRoute />,
      children: [
        {
          element: <ConsumerAuthLayout />,
          children: [
            {
              path: ROUTES.consultaLogin,
              element: lazyRoute(
                () => import("@/modules/torres-consulta/pages/cliente/login-page"),
                "ClienteLoginPage",
              ),
            },
            {
              path: ROUTES.consultaRegister,
              element: lazyRoute(
                () => import("@/modules/torres-consulta/pages/cliente/register-page"),
                "ClienteRegisterPage",
              ),
            },
            {
              path: ROUTES.consultaForgotPassword,
              element: lazyRoute(
                () => import("@/modules/torres-consulta/pages/cliente/forgot-password-page"),
                "ClienteForgotPasswordPage",
              ),
            },
            {
              path: ROUTES.consultaResetPassword,
              element: lazyRoute(
                () => import("@/modules/torres-consulta/pages/cliente/reset-password-page"),
                "ClienteResetPasswordPage",
              ),
            },
          ],
        },
        ...legacyAuthRedirects,
      ],
    },
  ],

  consumer: [
    {
      element: <ClienteLayout />,
      children: [
        {
          path: ROUTES.consultaApp,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/dashboard-page"),
            "ClienteDashboardPage",
          ),
        },
        {
          path: ROUTES.consultaAppConsultas,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/consultas-page"),
            "ClienteConsultasPage",
          ),
        },
        {
          path: ROUTE_PATTERNS.consultaAppConsultaDetail,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/consulta-detail-page"),
            "ClienteConsultaDetailPage",
          ),
        },
        {
          path: ROUTES.consultaAppNovaConsulta,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/nova-consulta-page"),
            "ConsultaAppNovaConsultaPage",
          ),
        },
        {
          path: ROUTES.consultaAppMinhaConta,
          element: lazyRoute(
            () => import("@/modules/torres-consulta/pages/cliente/profile-page"),
            "ClienteProfilePage",
          ),
        },
        ...legacyConsumerRedirects,
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
