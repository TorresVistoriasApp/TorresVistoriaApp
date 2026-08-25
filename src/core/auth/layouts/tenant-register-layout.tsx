import { AuthRegisterLayout } from "@/core/auth/layouts/auth-register-layout";
import { TenantAuthHeader } from "@/core/auth/layouts/tenant-auth-header";

export function TenantRegisterLayout() {
  return <AuthRegisterLayout header={<TenantAuthHeader />} />;
}
