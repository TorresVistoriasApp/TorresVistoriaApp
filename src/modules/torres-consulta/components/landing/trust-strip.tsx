import { Clock, Database, FileCheck, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LandingIconBox } from "./landing-ui";

const TRUST_ITEMS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Database, label: "Fontes oficiais", value: "Bases nacionais" },
  { icon: Clock, label: "Entrega", value: "Na hora" },
  { icon: FileCheck, label: "Relatório", value: "PDF completo" },
  { icon: Shield, label: "Privacidade", value: "Conforme LGPD" },
];

export function TrustStrip() {
  return (
    <section aria-label="Diferenciais da consulta" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 py-6 sm:grid-cols-4 sm:py-7">
          {TRUST_ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <LandingIconBox tone="neutral" className="h-9 w-9">
                <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </LandingIconBox>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.07em] text-subtle-foreground">
                  {item.label}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
