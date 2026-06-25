import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormSectionCardProps {
  id?: string;
  index: number;
  title: string;
  description?: string;
  children: ReactNode;
  optional?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function FormSectionCard({
  id,
  index,
  title,
  description,
  children,
  optional = false,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isCollapsible = collapsible || optional;

  return (
    <div id={id} className={cn("scroll-mt-24", className)}>
      <Card className="overflow-hidden shadow-soft">
        {isCollapsible ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 sm:gap-4 sm:px-6 sm:py-5"
            aria-expanded={open}
          >
            <SectionBadge index={index} optional={optional} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold leading-tight sm:text-lg">{title}</p>
                    {optional && (
                      <span className="rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Opcional
                      </span>
                    )}
                  </div>
                  {description && (
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {description}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </div>
              {optional && !open && (
                <p className="mt-2 text-xs text-muted-foreground">Toque para expandir e preencher</p>
              )}
            </div>
          </button>
        ) : (
          <CardHeader className="flex-row items-start gap-3 space-y-0 border-b-0 pb-0 sm:gap-4 lg:py-4">
            <SectionBadge index={index} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-base font-semibold leading-tight sm:text-lg">{title}</p>
              {description && (
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {description}
                </p>
              )}
            </div>
          </CardHeader>
        )}

        {(!isCollapsible || open) && (
          <CardContent
            className={cn(
              "space-y-5 px-4 pb-5 pt-0 sm:px-6 sm:pb-6 lg:space-y-4 lg:px-5 lg:pb-5",
              isCollapsible && "border-t border-border/60 pt-5 lg:pt-4",
              !isCollapsible && "pt-1",
            )}
          >
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function SectionBadge({ index, optional }: { index: number; optional?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:size-10",
        optional
          ? "border border-dashed border-muted-foreground/35 bg-muted/30 text-muted-foreground"
          : "bg-primary/10 text-primary ring-4 ring-primary/5",
      )}
    >
      {index}
    </span>
  );
}
