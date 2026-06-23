import type { ReactNode } from "react";
import { AppProviders } from "@/app/providers";

export function RootLayout({ children }: { children: ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
