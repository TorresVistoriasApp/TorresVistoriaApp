import { ROUTES } from "@/config/routes";
import { lazyRoute } from "@/routes/lazy-route";
import type { ModuleRoutes } from "@/routes/route-contract";

export const authRoutes: ModuleRoutes = {
  auth: [
    {
      path: ROUTES.login,
      element: lazyRoute(() => import("@/core/auth/pages/login-page"), "LoginPage"),
    },
    {
      path: ROUTES.forgotPassword,
      element: lazyRoute(() => import("@/core/auth/pages/forgot-password-page"), "ForgotPasswordPage"),
    },
    {
      path: ROUTES.resetPassword,
      element: lazyRoute(() => import("@/core/auth/pages/reset-password-page"), "ResetPasswordPage"),
    },
  ],
  // Fora do ClientLayout: a troca obrigatória roda antes do shell do tenant.
  standalone: [
    {
      path: ROUTES.changePassword,
      element: lazyRoute(() => import("@/core/auth/pages/change-password-page"), "ChangePasswordPage"),
    },
  ],
};
