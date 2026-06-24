import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLgpdConsent } from "@/hooks/use-lgpd-consent";

export function LgpdConsentBanner() {
  const { hasConsent, accept } = useLgpdConsent();

  if (hasConsent) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="lgpd-title"
      aria-describedby="lgpd-desc"
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-border bg-background p-4 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border"
    >
      <h2 id="lgpd-title" className="text-sm font-semibold">
        Privacidade e cookies
      </h2>
      <p id="lgpd-desc" className="mt-1 text-xs text-muted-foreground">
        Usamos cookies essenciais para autenticação e preferências. Consulte nossa{" "}
        <Link to="/privacidade" className="text-primary underline">
          Política de Privacidade
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" className="touch-target" onClick={() => accept(false)}>
          Aceitar essenciais
        </Button>
        <Button type="button" size="sm" variant="outline" className="touch-target" onClick={() => accept(true)}>
          Aceitar todos
        </Button>
      </div>
    </div>
  );
}
