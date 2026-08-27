import { Clock, Database, FileCheck, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TRUST_ITEMS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Database, label: "Fontes oficiais", value: "Bases nacionais" },
  { icon: Clock, label: "Entrega", value: "Na hora" },
  { icon: FileCheck, label: "Relatório", value: "PDF completo" },
  { icon: Shield, label: "Privacidade", value: "Conforme LGPD" },
];

export function TrustStrip() {
  return (
    <section
      aria-label="Diferenciais da consulta"
      className="border-y border-white/10 bg-[#0a0e14]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 py-7 sm:grid-cols-4 sm:py-8">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">
                  {item.label}
                </p>
                <p className="truncate text-sm font-semibold text-white">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
