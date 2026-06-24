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
import { Scale, Shield } from "lucide-react";

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
    <div className="space-y-5">
      <ChecklistSummary {...summary} />

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
        <div className="flex items-start gap-2">
          <Scale className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Checklist técnico para vistoria cautelar com parâmetros exigidos pelo{" "}
            <strong className="text-foreground">DETRAN</strong>, seguradoras e{" "}
            <strong className="text-foreground">perícia judicial</strong>. Registre observações
            detalhadas em itens não conformes — são obrigatórias para validade do laudo.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {opt.label}
              {opt.count != null && opt.count > 0 && (
                <span className="ml-1 opacity-80">({opt.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
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
              "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
              activeCategory === g.key
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {getChecklistCategoryLabel(g.key)}
          </button>
        ))}
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

      <footer className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
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
