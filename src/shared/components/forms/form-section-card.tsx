import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  OptionalLabel,
  OptionalSectionHint,
  OPTIONAL_SECTION_COLLAPSED_HINT,
} from "@/shared/components/forms/optional-label";
import { cn } from "@/shared/lib/utils";

interface FormSectionCardProps {
  id?: string;
  index: number;
  title: string;
  description?: string;
  statusLabel?: string;
  children: ReactNode;
  optional?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function FormSectionCard({
  id,
  index,
  title,
  description,
  statusLabel,
  children,
  optional = false,
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  className,
}: FormSectionCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;
  const isCollapsible = collapsible || optional;

  const setOpen = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    onOpenChange?.(value);
  };

  return (
    <div id={id} className={cn("scroll-mt-24", className)}>
      <Card
        className={cn(
          "overflow-hidden",
          optional && !resolvedOpen && "border-dashed bg-muted",
        )}
      >
        {isCollapsible ? (
          <button
            type="button"
            onClick={() => setOpen(!resolvedOpen)}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-brand-subtle sm:gap-4 sm:px-6 sm:py-5",
            )}
            aria-expanded={resolvedOpen}
          >
            <SectionBadge index={index} optional={optional} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold leading-tight sm:text-lg">{title}</p>
                    {optional && <OptionalLabel variant="section" />}
                  </div>
                  {description && (
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  {statusLabel && <SectionStatus label={statusLabel} />}
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform",
                      resolvedOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </div>
              </div>
              {optional && !resolvedOpen && (
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                  {OPTIONAL_SECTION_COLLAPSED_HINT}
                </p>
              )}
            </div>
          </button>
        ) : (
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b-0 pb-0 sm:gap-4 lg:py-4">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
              <SectionBadge index={index} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-base font-semibold leading-tight sm:text-lg">{title}</p>
                {description && (
                  <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {statusLabel && <SectionStatus label={statusLabel} className="mt-1" />}
          </CardHeader>
        )}

        {(!isCollapsible || resolvedOpen) && (
          <CardContent
            className={cn(
              "space-y-5 px-4 pb-5 pt-0 sm:px-6 sm:pb-6 lg:space-y-4 lg:px-5 lg:pb-5",
              isCollapsible && "border-t border-border pt-5 lg:pt-4",
              !isCollapsible && "pt-1",
            )}
          >
            {optional && <OptionalSectionHint />}
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function SectionStatus({ label, className }: { label: string; className?: string }) {
  return <span className={cn("ui-badge", className)}>{label}</span>;
}

function SectionBadge({ index, optional }: { index: number; optional?: boolean }) {
  return (
    <span
      className={cn(
        "ui-icon-box ui-metric size-9 shrink-0 rounded-full text-sm font-bold sm:size-10",
        optional && "ui-icon-box-neutral",
      )}
    >
      {index}
    </span>
  );
}
