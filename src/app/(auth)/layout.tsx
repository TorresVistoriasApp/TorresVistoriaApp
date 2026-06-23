import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-muted/40">
      <Outlet />
    </div>
  );
}
