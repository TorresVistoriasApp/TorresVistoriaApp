import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ProductCrossLinkProps {
  to: string;
  label: string;
  className?: string;
}

export function ProductCrossLink({ to, label, className }: ProductCrossLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
