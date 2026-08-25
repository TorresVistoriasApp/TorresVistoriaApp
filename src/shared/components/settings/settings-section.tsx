import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export const SETTINGS_FIELD_LABEL_CLASS =
  "text-sm font-medium normal-case tracking-normal text-foreground";

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  className,
  action,
  fillHeight = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  fillHeight?: boolean;
}) {
  return (
    <section
      className={cn(
        "ui-panel min-w-0 overflow-hidden",
        fillHeight ? "flex h-full flex-col" : "h-fit",
        className,
      )}
    >
      <div className="shrink-0 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="ui-icon-box h-10 w-10" aria-hidden>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold text-foreground">{title}</h2>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
        </div>
      </div>
      <div
        className={cn(
          "px-4 py-4 sm:px-5 sm:py-5",
          fillHeight && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {children}
      </div>
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
        "rounded-lg border border-border bg-muted px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm",
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
    <div className={cn("mt-6 border-t border-border pt-5", className)}>
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
