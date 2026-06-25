import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formGridClass } from "@/lib/form-styles";

interface FormFieldGroupProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function FormFieldGroup({
  title,
  description,
  children,
  className,
  bordered = true,
}: FormFieldGroupProps) {
  return (
    <section className={cn("space-y-4", bordered && "pt-1 first:pt-0", className)}>
      <div className={cn(bordered && "border-b border-border/50 pb-3")}>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      <div className={formGridClass}>{children}</div>
    </section>
  );
}
