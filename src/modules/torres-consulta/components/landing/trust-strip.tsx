import { Clock, Database, FileCheck, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TRUST_ITEMS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Database, label: "Origem dos dados", value: "Bases oficiais" },
  { icon: Clock, label: "Velocidade", value: "Resultado na hora" },
  { icon: FileCheck, label: "Entrega", value: "PDF completo" },
  { icon: Shield, label: "Privacidade", value: "Conforme a LGPD" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Por que escolher a Torres Consulta"
      className="border-y border-white/[0.06] bg-[#080b10]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 divide-white/[0.06] sm:grid-cols-4 sm:divide-x">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3.5 px-0 py-7 first:pl-0 last:pr-0 sm:px-6 sm:py-8"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-primary">
                <item.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                  {item.label}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold tracking-tight text-white">
                  {item.value}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
