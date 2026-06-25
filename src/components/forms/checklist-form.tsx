import { useMemo, useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistCategory } from "@/components/checklist/checklist-category";
import { ChecklistSummary, summarizeChecklist } from "@/components/checklist/checklist-summary";
import {
  CHECKLIST_CATALOG,
  CHECKLIST_CATEGORY_ORDER,
  getChecklistCategoryLabel,
} from "@/lib/checklist-catalog";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { ChevronDown, Scale, Shield } from "lucide-react";

type FilterKey = "ALL" | "PENDING" | "NON_CONFORM";

export function ChecklistForm({
  items,
  onUpdate,
  disabled,
}: {
  items: ChecklistItem[];
  onUpdate: (id: string, status: string, notes?: string) => void;
  disabled?: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});

    return CHECKLIST_CATEGORY_ORDER.filter((key) => map[key]?.length).map((key) => ({
      key,
      items: map[key] ?? [],
      description: CHECKLIST_CATALOG.find((c) => c.key === key)?.description,
    }));
  }, [items]);

  const filteredGroups = useMemo(() => {
    return grouped
      .filter((g) => !activeCategory || g.key === activeCategory)
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (filter === "PENDING") return item.status === ChecklistStatus.PENDENTE;
          if (filter === "NON_CONFORM") return item.status === ChecklistStatus.NAO_CONFORME;
          return true;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [grouped, filter, activeCategory]);

  const summary = summarizeChecklist(items);

  let runningIndex = 0;
  const categoriesWithIndex = filteredGroups.map((g) => {
    const start = runningIndex;
    runningIndex += g.items.length;
    return { ...g, startIndex: start };
  });

  const filterOptions: { key: FilterKey; label: string; count?: number }[] = [
    { key: "ALL", label: "Todos", count: items.length },
    { key: "PENDING", label: "Pendentes", count: summary.pending },
    { key: "NON_CONFORM", label: "Não conformes", count: summary.naoConforme },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="hidden md:block">
        <ChecklistSummary {...summary} />
      </div>

      <details className="group rounded-xl border border-border bg-muted/20 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Scale className="size-4 shrink-0 text-primary" />
            Orientações do checklist
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <p className="border-t border-border/60 px-3 pb-3 text-xs leading-relaxed text-muted-foreground">
          Checklist técnico para vistoria cautelar com parâmetros exigidos pelo{" "}
          <strong className="text-foreground">DETRAN</strong>, seguradoras e{" "}
          <strong className="text-foreground">perícia judicial</strong>. Registre observações
          detalhadas em itens não conformes, pois são obrigatórias para a validade do laudo.
        </p>
      </details>
      <div className="hidden rounded-xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground md:block">
        <div className="flex items-start gap-2">
          <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Checklist técnico para vistoria cautelar com parâmetros exigidos pelo{" "}
            <strong className="text-foreground">DETRAN</strong>, seguradoras e{" "}
            <strong className="text-foreground">perícia judicial</strong>. Registre observações
            detalhadas em itens não conformes, pois são obrigatórias para a validade do laudo.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-card p-3 md:border-0 md:bg-transparent md:p-0">
        <div className="md:hidden">
          <ChecklistSummary {...summary} variant="compact" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                filter === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {opt.label}
              {opt.count != null && opt.count > 0 && (
                <span className="ml-1 opacity-80">({opt.count})</span>
              )}
            </button>
          ))}
        </div>

        <div className="md:hidden">
          <label htmlFor="checklist-section" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Seção
          </label>
          <select
            id="checklist-section"
            value={activeCategory ?? ""}
            onChange={(e) => setActiveCategory(e.target.value || null)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="">Todas as seções ({items.length} itens)</option>
            {grouped.map((g) => (
              <option key={g.key} value={g.key}>
                {getChecklistCategoryLabel(g.key)} ({g.items.length})
              </option>
            ))}
          </select>
        </div>

        <div className="hidden flex-wrap gap-2 md:flex">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              !activeCategory ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
            )}
          >
            Todas as seções
          </button>
          {grouped.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActiveCategory(g.key)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                activeCategory === g.key
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {getChecklistCategoryLabel(g.key)}
            </button>
          ))}
        </div>
      </div>

      {categoriesWithIndex.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nenhum item corresponde ao filtro selecionado.
        </div>
      ) : (
        categoriesWithIndex.map((g) => (
          <ChecklistCategory
            key={g.key}
            category={g.key}
            description={g.description}
            items={g.items}
            startIndex={g.startIndex}
            disabled={disabled}
            onUpdate={onUpdate}
          />
        ))
      )}

      <details className="group rounded-xl border border-border bg-card md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Shield className="size-4 shrink-0" />
            Validade probatória do laudo
          </span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <p className="border-t border-border/60 px-3 pb-3 text-xs leading-relaxed text-muted-foreground">
          Laudo gerado com base neste checklist possui valor probatório quando acompanhado de
          fotos georreferenciadas e assinatura do vistoriador credenciado. Itens não avaliados
          podem comprometer a aceitação pelo DETRAN ou em processos judiciais.
        </p>
      </details>
      <footer className="hidden items-start gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground md:flex">
        <Shield className="mt-0.5 size-4 shrink-0" />
        <p>
          Laudo gerado com base neste checklist possui valor probatório quando acompanhado de
          fotos georreferenciadas e assinatura do vistoriador credenciado. Itens não avaliados
          podem comprometer a aceitação pelo DETRAN ou em processos judiciais.
        </p>
      </footer>
    </div>
  );
}

/** Verifica se o checklist está pronto para finalização. */
export function validateChecklistCompletion(items: ChecklistItem[]): {
  valid: boolean;
  pendingCount: number;
  missingNotesCount: number;
} {
  const pendingCount = items.filter((i) => i.status === ChecklistStatus.PENDENTE).length;
  const missingNotesCount = items.filter(
    (i) => i.status === ChecklistStatus.NAO_CONFORME && !(i.notes?.trim()),
  ).length;

  return {
    valid: pendingCount === 0 && missingNotesCount === 0,
    pendingCount,
    missingNotesCount,
  };
}
