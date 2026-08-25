import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

export function AuthRegisterLayout({ header }: { header: ReactNode }) {
  return (
    <div className="consulta-page flex min-h-dvh flex-col">
      {header}
      <main className="landing-hero-bg relative flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
