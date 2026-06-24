import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

const ICON_THEMES = [
  {
    icon: "from-orange-500/25 via-orange-500/12 to-orange-400/5 text-orange-600",
    halo: "from-orange-500/30 to-orange-400/5",
    accent: "via-orange-500/50",
    glow: "bg-orange-500/12",
  },
  {
    icon: "from-amber-500/25 via-amber-500/12 to-amber-400/5 text-amber-600",
    halo: "from-amber-500/30 to-amber-400/5",
    accent: "via-amber-500/50",
    glow: "bg-amber-500/12",
  },
  {
    icon: "from-emerald-500/25 via-emerald-500/12 to-emerald-400/5 text-emerald-600",
    halo: "from-emerald-500/30 to-emerald-400/5",
    accent: "via-emerald-500/50",
    glow: "bg-emerald-500/12",
  },
  {
    icon: "from-slate-500/25 via-slate-500/12 to-slate-400/5 text-slate-600",
    halo: "from-slate-500/30 to-slate-400/5",
    accent: "via-slate-500/50",
    glow: "bg-slate-500/12",
  },
] as const;

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
  themeIndex?: number;
}

function KpiLabel({ children }: { children: string }) {
  return (
    <div className="flex w-full max-w-[220px] items-center justify-center gap-2.5">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border/80 to-border/30" />
      <p className="shrink-0 text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground/85 sm:text-[10px]">
        {children}
      </p>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border/80 to-border/30" />
    </div>
  );
}

export function KpiCard({
  label,
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  trendUp,
  themeIndex = 0,
}: KpiCardProps) {
  const heading = title ?? label ?? "";
  const theme = ICON_THEMES[themeIndex % ICON_THEMES.length];

  return (
    <div className="kpi-card group relative h-full min-h-[160px] sm:min-h-[172px]">
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500",
          theme.glow,
          "opacity-60 group-hover:scale-110 group-hover:opacity-90",
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-slate-400/8 blur-3xl"
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent to-transparent opacity-80",
          theme.accent,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex h-full min-h-[160px] flex-col items-center justify-center gap-4 px-5 py-7 text-center sm:min-h-[172px] sm:gap-4 sm:px-6 sm:py-8">
        {Icon ? (
          <div className="relative shrink-0">
            <div
              className={cn(
                "absolute inset-0 scale-[1.18] rounded-[1.15rem] bg-gradient-to-br opacity-70 blur-lg transition-opacity duration-500 group-hover:opacity-100",
                theme.halo,
              )}
              aria-hidden
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-white/90 shadow-[0_8px_20px_rgb(15_23_42_/_0.08)] ring-1 ring-black/[0.04] backdrop-blur-sm sm:h-[3.25rem] sm:w-[3.25rem]">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-gradient-to-br ring-1 ring-inset ring-white/60 sm:h-11 sm:w-11",
                  theme.icon,
                )}
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-accent/80 shadow-[0_0_12px_rgb(234_88_12_/_0.35)]"
            aria-hidden
          />
        )}

        <div className="flex w-full flex-col items-center justify-center gap-2">
          <KpiLabel>{heading}</KpiLabel>

          {isLoading ? (
            <div className="h-10 w-32 animate-pulse rounded-2xl bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50 sm:h-11 sm:w-36" />
          ) : (
            <>
              <p className="kpi-card-value text-[1.75rem] font-bold leading-none text-foreground sm:text-[1.95rem] xl:text-[2.125rem]">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm sm:text-xs",
                    trendUp
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
                      : "border-red-500/25 bg-red-500/10 text-red-600",
                  )}
                >
                  {trendUp ? (
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {trend}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
