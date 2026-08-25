import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { AuthPageHeader } from "@/core/auth/layouts/auth-page-header";
import { BrandLogo } from "@/shared/components/brand-logo";

export function TenantAuthHeader() {
  return (
    <AuthPageHeader
      logoTo={ROUTES.consultaLanding}
      logoAriaLabel="Torres Vistorias, ir para Torres Consulta"
      logo={<BrandLogo size="sm" />}
    />
  );
}
