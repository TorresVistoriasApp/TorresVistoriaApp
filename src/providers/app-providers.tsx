import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "@/core/auth/session-context";
import { AuthProvider } from "@/core/auth/auth-context";
import { UserProvider } from "@/core/auth/user-context";
import { CompanyProvider } from "@/core/tenant/company-context";
import { PermissionProvider } from "@/core/rbac/permission-context";
import { ErrorBoundary } from "@/core/errors/error-boundary";
import { ToastViewport } from "@/shared/components/toast-viewport";
import { LgpdConsentBanner } from "@/core/compliance/components/lgpd-consent-banner";
import { queryClient } from "@/infra/query/query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthProvider>
          <UserProvider>
            <CompanyProvider>
              <PermissionProvider>
                <ErrorBoundary>
                  {children}
                  <ToastViewport />
                  <LgpdConsentBanner />
                  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                </ErrorBoundary>
              </PermissionProvider>
            </CompanyProvider>
          </UserProvider>
        </AuthProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
