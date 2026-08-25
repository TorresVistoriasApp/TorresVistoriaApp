import { AuthRegisterLayout } from "@/core/auth/layouts/auth-register-layout";
import { ConsumerAuthHeader } from "@/modules/torres-consulta/layouts/consumer-auth-header";

export function ConsumerRegisterLayout() {
  return <AuthRegisterLayout header={<ConsumerAuthHeader />} />;
}
