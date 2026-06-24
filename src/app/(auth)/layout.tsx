import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-canvas">
      <Outlet />
    </div>
  );
}
