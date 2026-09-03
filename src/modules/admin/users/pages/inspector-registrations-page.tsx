import { InspectorRegistrationsQueue } from "@/modules/admin/users/components/inspector-registrations-queue";
import { useAuth } from "@/core/auth/use-auth";
import { useTenant } from "@/core/tenant/use-tenant";
import { ROUTES } from "@/config/routes";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

export function InspectorRegistrationsPage() {
  const { profile } = useAuth();
  const { data: company, isLoading } = useTenant();

  if (isLoading || !profile?.tenant_id) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <InspectorRegistrationsQueue
      backTo={{ href: ROUTES.users, label: "Voltar aos usuários" }}
      lockedTenant={{
        id: profile.tenant_id,
        name: company?.trade_name ?? "Sua empresa",
      }}
    />
  );
}
