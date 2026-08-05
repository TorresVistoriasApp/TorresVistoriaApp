import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "@/app/session-context";
import { AuthProvider } from "@/app/auth-context";
import { UserProvider } from "@/app/user-context";
import { CompanyProvider } from "@/app/company-context";
import { PermissionProvider } from "@/app/permission-context";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ToastViewport } from "@/components/shared/toast-viewport";
import { LgpdConsentBanner } from "@/components/shared/lgpd-consent-banner";
import { queryClient } from "@/lib/query-client";

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
