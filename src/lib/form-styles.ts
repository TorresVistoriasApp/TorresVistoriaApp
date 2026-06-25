import { cn } from "@/lib/utils";

/** Grid responsivo padrão para formulários */
export const formGridClass = cn(
  "grid grid-cols-1 gap-x-5 gap-y-5",
  "sm:grid-cols-2 sm:gap-x-6",
  "lg:gap-x-8 lg:gap-y-6",
);

export const formGridFullWidthClass = "sm:col-span-2";

export const selectInputClass = cn(
  "flex h-11 w-full min-h-[44px] rounded-xl border border-border bg-card px-4 text-sm shadow-soft touch-target",
  "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

export const textareaInputClass = cn(
  "w-full min-h-[120px] rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed shadow-soft",
  "placeholder:text-muted-foreground/80",
  "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
);

export const formIntroClass =
  "rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 sm:px-5 sm:py-3.5";
