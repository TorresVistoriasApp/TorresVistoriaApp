import { ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import { TenantAuthRoute } from "@/routes/guards/tenant-auth-route";
import { InspectorPendingRoute } from "@/routes/guards/inspector-pending-route";
import type { ModuleRoutes } from "@/routes/route-contract";
import { TenantAuthLayout } from "@/core/auth/layouts/tenant-auth-layout";

export const authRoutes: ModuleRoutes = {
  auth: [
    {
      element: <TenantAuthRoute />,
      children: [
        {
          element: <TenantAuthLayout />,
          children: [
            {
              path: ROUTES.login,
              element: lazyRoute(() => import("@/core/auth/pages/login-page"), "LoginPage"),
            },
            {
              path: ROUTES.forgotPassword,
              element: lazyRoute(
                () => import("@/core/auth/pages/forgot-password-page"),
                "ForgotPasswordPage",
              ),
            },
            {
              path: ROUTES.resetPassword,
              element: lazyRoute(
                () => import("@/core/auth/pages/reset-password-page"),
                "ResetPasswordPage",
              ),
            },
            {
              path: ROUTES.vistoriaRegister,
              element: lazyRoute(
                () => import("@/core/auth/pages/inspector-register-page"),
                "InspectorRegisterPage",
              ),
            },
          ],
        },
      ],
    },
    {
      element: <InspectorPendingRoute />,
      children: [
        {
          path: ROUTES.vistoriaPendingApproval,
          element: lazyRoute(
            () => import("@/core/auth/pages/inspector-pending-approval-page"),
            "InspectorPendingApprovalPage",
          ),
        },
      ],
    },
  ],
  standalone: [
    {
      path: ROUTES.changePassword,
      element: lazyRoute(() => import("@/core/auth/pages/change-password-page"), "ChangePasswordPage"),
    },
  ],
};
