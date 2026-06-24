import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLgpdConsent } from "@/hooks/use-lgpd-consent";
import { ROUTES } from "@/lib/constants";

export function LgpdConsentBanner() {
  const { hasConsent, accept } = useLgpdConsent();

  if (hasConsent) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="lgpd-title"
      aria-describedby="lgpd-desc"
      className="surface-elevated fixed inset-x-4 bottom-20 z-[100] p-5 md:bottom-6 md:left-6 md:right-auto md:max-w-md"
    >
      <h2 id="lgpd-title" className="font-display text-base font-normal tracking-tight">
        Privacidade e cookies
      </h2>
      <p id="lgpd-desc" className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Usamos cookies essenciais para autenticação e preferências. Consulte nossos{" "}
        <Link to={ROUTES.privacy} className="font-medium text-accent hover:underline">
          Termos de Uso e LGPD
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="accent" className="touch-target" onClick={() => accept(false)}>
          Aceitar essenciais
        </Button>
        <Button type="button" size="sm" variant="outline" className="touch-target" onClick={() => accept(true)}>
          Aceitar todos
        </Button>
      </div>
    </div>
  );
}
