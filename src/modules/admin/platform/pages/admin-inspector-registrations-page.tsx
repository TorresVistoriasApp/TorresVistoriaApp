import { InspectorRegistrationsQueue } from "@/modules/admin/users/components/inspector-registrations-queue";
import { ROUTES } from "@/config/routes";

export function AdminInspectorRegistrationsPage() {
  return (
    <InspectorRegistrationsQueue
      backTo={{ href: ROUTES.adminCompanies, label: "Voltar às empresas" }}
    />
  );
}
