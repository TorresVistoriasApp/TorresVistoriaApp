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

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm font-medium text-white/60 transition-colors hover:text-primary"
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
    <footer className="border-t border-white/[0.06] bg-[#080b10] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-12">
          <div className="sm:col-span-2">
            <ConsultaBrandLogo size="md" onDark />
            <p className="mt-5 max-w-xs text-sm font-medium leading-[1.7] text-white/45">
              Consulta veicular completa para pessoa física. Tecnologia, segurança e transparência
              na hora de comprar seu veículo.
            </p>
            <div className="mt-6 flex gap-2">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-white/40 transition-colors hover:border-primary/35 hover:text-primary"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Empresa" links={MARKETING_FOOTER.empresa} />
          <FooterColumn title="Produto" links={MARKETING_FOOTER.produto} />
          <FooterColumn title="Legal" links={MARKETING_FOOTER.legal} />
          <FooterColumn title="Suporte" links={MARKETING_FOOTER.suporte} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide text-white/35">
            © {new Date().getFullYear()} Torres Consulta. Todos os direitos reservados.
          </p>
          <p className="text-xs tracking-wide text-white/35">
            Parte do Ecossistema Torres. Conheça também a{" "}
            <Link
              to={ROUTES.vistoriaLogin}
              className="font-semibold text-white/70 hover:text-primary"
            >
              Torres Vistoria
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
