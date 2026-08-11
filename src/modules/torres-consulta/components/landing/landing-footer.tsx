import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { MARKETING_FOOTER } from "@/modules/torres-consulta/components/marketing/marketing-nav";
import { ConsultaBrandLogo } from "./consulta-brand-logo";

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; to: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
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
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
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

          <FooterColumn title="Empresa" links={MARKETING_FOOTER.empresa} />
          <FooterColumn title="Produto" links={MARKETING_FOOTER.produto} />
          <FooterColumn title="Legal" links={MARKETING_FOOTER.legal} />
          <FooterColumn title="Suporte" links={MARKETING_FOOTER.suporte} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Torres Consulta. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-600">
            Parte do Ecossistema Torres. Conheça também a{" "}
            <Link to={ROUTES.vistoriaLogin} className="text-slate-400 hover:text-primary">
              Torres Vistoria
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
