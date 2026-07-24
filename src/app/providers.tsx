import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/app/auth-context";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ToastViewport } from "@/components/shared/toast-viewport";
import { LgpdConsentBanner } from "@/components/shared/lgpd-consent-banner";
import { queryClient } from "@/lib/query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          {children}
          <ToastViewport />
          <LgpdConsentBanner />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
