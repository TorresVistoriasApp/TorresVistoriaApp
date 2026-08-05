import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MobileBackButton({ to, label }: { to: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 text-sm text-primary hover:underline md:hidden"
    >
      <ArrowLeft className="h-4 w-4" />
      {label ?? "Voltar"}
    </button>
  );
}

/** Link variant for desktop */
export function MobileBackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
