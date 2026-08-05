import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface MarketingBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function MarketingBreadcrumb({ items, className }: MarketingBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        <li>
          <Link
            to={ROUTES.consultaLanding}
            className="inline-flex items-center gap-1 rounded-md transition-colors hover:text-primary"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Início</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              {isLast || !item.to ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
