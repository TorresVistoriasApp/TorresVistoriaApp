import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const SETTINGS_FIELD_LABEL_CLASS =
  "text-sm font-medium normal-case tracking-normal text-foreground";

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  className,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft",
        className,
      )}
    >
      <div className="border-b border-border/50 bg-muted/15 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10"
              aria-hidden
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
          {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

export function SettingsNotice({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "rounded-xl border border-border/60 bg-muted/25 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SettingsFormActions({
  children,
  className,
  hint,
}: {
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("mt-8 border-t border-border/50 pt-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {hint ? (
          <p className="text-xs leading-relaxed text-muted-foreground sm:max-w-sm sm:text-sm">
            {hint}
          </p>
        ) : (
          <span className="hidden sm:block sm:flex-1" aria-hidden />
        )}
        <div className="flex w-full flex-col sm:w-auto sm:shrink-0">{children}</div>
      </div>
    </div>
  );
}

export function SettingsSubheading({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-medium text-foreground">{children}</p>
  );
}
