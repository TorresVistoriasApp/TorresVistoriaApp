import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { ConsultaBrandLogo } from "./consulta-brand-logo";

const FOOTER_LINKS = {
  produto: [
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Planos", href: "#planos" },
    { label: "Perguntas Frequentes", href: "#faq" },
    { label: "Área do Cliente", to: ROUTES.clienteLogin },
  ],
  empresa: [
    { label: "Sobre a Torres", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Torres Vistoria (B2B)", to: ROUTES.vistoriaLogin },
  ],
  legal: [
    { label: "Política de Privacidade", to: ROUTES.privacy },
    { label: "Termos de Uso", to: ROUTES.termos },
    { label: "LGPD", to: ROUTES.lgpd },
  ],
} as const;

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <ConsultaBrandLogo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Consulta veicular completa para pessoa física. Tecnologia, segurança e transparência
              na hora de comprar seu veículo.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Produto</h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.produto.map((link) => (
                <li key={link.label}>
                  {"to" in link ? (
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Empresa</h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.empresa.map((link) => (
                <li key={link.label}>
                  {"to" in link ? (
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Torres Consulta. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-600">
            Parte do Ecossistema Torres —{" "}
            <Link to={ROUTES.vistoriaLogin} className="text-slate-400 hover:text-primary">
              Torres Vistoria
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
