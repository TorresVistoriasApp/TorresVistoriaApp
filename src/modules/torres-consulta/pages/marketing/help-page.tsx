import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { HELP_ARTICLES, HELP_CATEGORIES } from "@/modules/torres-consulta/data/help-center";
import { MarketingShell } from "@/modules/torres-consulta/components/marketing/marketing-shell";
import { ConversionCta } from "@/modules/torres-consulta/components/marketing/conversion-cta";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HELP_ARTICLES.filter((article) => {
      const matchCategory = !category || article.category === category;
      const matchQuery =
        !q ||
        article.question.toLowerCase().includes(q) ||
        article.answer.toLowerCase().includes(q) ||
        article.keywords.some((k) => k.includes(q));
      return matchCategory && matchQuery;
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof HELP_ARTICLES>();
    for (const article of filtered) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <MarketingShell
      seo={{
        title: "Central de Ajuda",
        description:
          "Encontre respostas sobre conta, pagamento, consultas, relatórios, privacidade e LGPD na Torres Consulta.",
        canonicalPath: ROUTES.ajuda,
        schema: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: HELP_ARTICLES.map((a) => ({
            "@type": "Question",
            name: a.question,
            acceptedAnswer: { "@type": "Answer", text: a.answer },
          })),
        },
      }}
      breadcrumb={[{ label: "Ajuda" }]}
      hero={{
        eyebrow: "Suporte",
        title: "Como podemos ajudar?",
        description: "Busque por palavra-chave ou navegue por categoria.",
        children: (
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar na central de ajuda..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 pl-11"
              aria-label="Buscar na central de ajuda"
            />
          </div>
        ),
      }}
      fullWidth
    >
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            !category ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          Todas
        </button>
        {HELP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              category === cat
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-12 text-center text-muted-foreground">
          Nenhum resultado para &ldquo;{query}&rdquo;.{" "}
          <Link to={ROUTES.contato} className="font-semibold text-primary hover:underline">
            Fale conosco
          </Link>
        </p>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([cat, articles]) => (
            <section key={cat}>
              <h2 className="text-lg font-bold text-foreground">{cat}</h2>
              <div className="mt-4 space-y-3">
                {articles.map((article) => (
                  <details
                    key={article.id}
                    className="group rounded-2xl border border-border/60 bg-white shadow-soft"
                  >
                    <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-foreground marker:content-none">
                      {article.question}
                    </summary>
                    <p className="border-t border-border/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                      {article.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConversionCta className="mt-14" />
    </MarketingShell>
  );
}
