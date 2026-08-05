import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
}

interface LegalDocLayoutProps {
  sections: LegalSection[];
  children: ReactNode;
}

const LEGAL_NAV = [
  { label: "Privacidade", path: ROUTES.privacy },
  { label: "Termos de Uso", path: ROUTES.termos },
  { label: "LGPD", path: ROUTES.lgpd },
  { label: "Cookies", path: ROUTES.cookies },
] as const;

export function LegalDocLayout({ sections, children }: LegalDocLayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="Documentos legais" className="mb-6 space-y-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Documentos
          </p>
          {LEGAL_NAV.map((doc) => (
            <Link
              key={doc.path}
              to={doc.path}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                pathname === doc.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {doc.label}
            </Link>
          ))}
        </nav>
        <nav aria-label="Índice do documento" className="hidden border-t border-border/60 pt-6 lg:block">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Nesta página
          </p>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <article className="min-w-0 space-y-8 text-sm leading-relaxed text-muted-foreground">
        {children}
      </article>
    </div>
  );
}

export function LegalSectionBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
