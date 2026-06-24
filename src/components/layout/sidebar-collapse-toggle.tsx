import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarCollapseToggleProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidebarCollapseToggle({
  collapsed,
  onToggle,
  className,
}: SidebarCollapseToggleProps) {
  const label = collapsed ? "Expandir menu" : "Recolher menu";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={cn(
        "group flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "border border-primary/25 bg-card text-primary shadow-sm",
        "ring-1 ring-primary/10 transition-all",
        "hover:border-primary/45 hover:bg-primary/10 hover:shadow-md",
        "active:scale-95",
        className,
      )}
    >
      {collapsed ? (
        <ChevronRight
          className="h-4 w-4 stroke-[2.75] transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      ) : (
        <ChevronLeft
          className="h-4 w-4 stroke-[2.75] transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      )}
    </button>
  );
}
