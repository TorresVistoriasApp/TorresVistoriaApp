import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { db } from "@/infra/supabase/client";
import { usePermission } from "@/core/rbac/use-permission";
import { Button } from "@/shared/ui/button";
import { SettingsSection } from "@/shared/components/settings/settings-section";
import { MfaEnrollForm } from "@/core/auth/components/mfa-enroll-form";
import { isPrivilegedAccount } from "@/core/auth/mfa";
import { useAuth } from "@/core/auth/use-auth";

type TotpFactor = { id: string; status: string; friendly_name?: string };

export function MfaTotpSection({ className }: { className?: string }) {
  const { can } = usePermission();
  const { profile, isPlatformAdmin } = useAuth();
  const privileged = isPrivilegedAccount(profile, isPlatformAdmin);
  const recommend = privileged || can("users.manage") || can("settings.manage");
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data, error: listError } = await db.auth.mfa.listFactors();
    if (listError) throw listError;
    setFactors((data?.totp ?? []) as TotpFactor[]);
  }, []);

  useEffect(() => {
    let active = true;
    void refresh()
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Não foi possível carregar o MFA.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refresh]);

  const removeFactor = async (factorId: string) => {
    setError(null);
    setBusy(true);
    try {
      const { error: unenrollError } = await db.auth.mfa.unenroll({ factorId });
      if (unenrollError) throw unenrollError;
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover o MFA.");
    } finally {
      setBusy(false);
    }
  };

  const verified = factors.filter((factor) => factor.status === "verified");
  const lockLastFactor = privileged && verified.length <= 1;

  return (
    <SettingsSection
      icon={ShieldCheck}
      title="Verificação em duas etapas"
      description={
        privileged
          ? "Obrigatória para administradores. Um aplicativo autenticador confirma o login além da senha."
          : recommend
            ? "Recomendado para administradores. Um aplicativo autenticador confirma o login além da senha."
            : "Um aplicativo autenticador confirma o login além da senha. Opcional nesta etapa."
      }
      className={className}
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="space-y-4">
          {verified.length > 0 ? (
            <ul className="space-y-2">
              {verified.map((factor) => (
                <li
                  key={factor.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>{factor.friendly_name || "Aplicativo autenticador"} — ativo</span>
                  {lockLastFactor ? (
                    <span className="text-xs text-muted-foreground">Obrigatório nesta conta</span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => void removeFactor(factor.id)}
                    >
                      Remover
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <MfaEnrollForm onEnrolled={() => void refresh()} />
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      )}
    </SettingsSection>
  );
}
