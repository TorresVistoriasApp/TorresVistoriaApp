import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { DraftSystemProvider } from "@/features/draft/components/draft-system-provider";

export function DashboardLayout() {
  return (
    <DraftSystemProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </DraftSystemProvider>
  );
}
