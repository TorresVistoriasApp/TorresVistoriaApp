import { Outlet, Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";

export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background px-4 py-3">
        <Link to="/login" className="text-sm font-semibold text-primary">
          {APP_NAME}
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
