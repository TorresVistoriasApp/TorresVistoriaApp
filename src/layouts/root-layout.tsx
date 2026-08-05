import { Outlet } from "react-router-dom";
import { AppProviders } from "@/providers/app-providers";

export function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
