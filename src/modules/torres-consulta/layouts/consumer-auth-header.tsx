import { ROUTES } from "@/config/routes";
import { AuthPageHeader } from "@/core/auth/layouts/auth-page-header";
import { ConsultaBrandLogo } from "@/modules/torres-consulta/components/landing/consulta-brand-logo";

export function ConsumerAuthHeader() {
  return (
    <AuthPageHeader
      logoTo={ROUTES.consultaLanding}
      logoAriaLabel="Torres Consulta, ir para o início"
      logo={<ConsultaBrandLogo size="sm" showSubtitle={false} />}
    />
  );
}
