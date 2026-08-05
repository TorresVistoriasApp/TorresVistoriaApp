import { Navigate, Outlet, useParams } from "react-router-dom";
import { InspectionProvider } from "@/modules/torres-vistoria/context/inspection-context";
import { ROUTES } from "@/config/routes";

/** Layout das rotas /vistorias/:id/* — injeta InspectionProvider uma vez por vistoria. */
export function InspectionLayout() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to={ROUTES.inspections} replace />;
  }

  return (
    <InspectionProvider inspectionId={id}>
      <Outlet />
    </InspectionProvider>
  );
}
