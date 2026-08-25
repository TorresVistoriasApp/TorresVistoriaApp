import { Outlet } from "react-router-dom";
import { TenantAuthHeader } from "@/core/auth/layouts/tenant-auth-header";

export function TenantRegisterLayout() {
  return (
    <div className="consulta-page flex min-h-dvh flex-col">
      <TenantAuthHeader />
      <main className="landing-hero-bg relative flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
