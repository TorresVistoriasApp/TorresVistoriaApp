import { Outlet } from "react-router-dom";
import { AppShell } from "@/layouts/components/app-shell";
import { DraftSystemProvider } from "@/modules/torres-vistoria/draft/components/draft-system-provider";

export function ClientLayout() {
  return (
    <DraftSystemProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </DraftSystemProvider>
  );
}
