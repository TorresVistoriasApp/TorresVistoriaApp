import { useCallback, useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { db } from "@/infra/supabase/client";
import { usePermission } from "@/core/rbac/use-permission";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SettingsSection } from "@/shared/components/settings/settings-section";

type TotpFactor = { id: string; status: string; friendly_name?: string };

export function MfaTotpSection({ className }: { className?: string }) {
  const { can } = usePermission();
  const recommend = can("users.manage") || can("settings.manage");
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
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

  const startEnroll = async () => {
    setError(null);
    setBusy(true);
    try {
      const { data, error: enrollError } = await db.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Torres App",
      });
      if (enrollError) throw enrollError;
      if (!data?.id || !data.totp?.qr_code) throw new Error("Não foi possível iniciar o MFA.");
      setEnrolling({
        factorId: data.id,
        qr: data.totp.qr_code,
        secret: data.totp.secret ?? "",
      });
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o MFA.");
    } finally {
      setBusy(false);
    }
  };

  const confirmEnroll = async () => {
    if (!enrolling) return;
    setError(null);
    setBusy(true);
    try {
      const { data: challenge, error: challengeError } = await db.auth.mfa.challenge({
        factorId: enrolling.factorId,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await db.auth.mfa.verify({
        factorId: enrolling.factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      setEnrolling(null);
      setCode("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

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

  return (
    <SettingsSection
      icon={ShieldCheck}
      title="Verificação em duas etapas"
      description={
        recommend
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void removeFactor(factor.id)}
                  >
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          ) : enrolling ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR no autenticador e informe o código de 6 dígitos.
              </p>
              <img
                src={enrolling.qr}
                alt="QR Code para ativar a verificação em duas etapas"
                className="mx-auto h-40 w-40 rounded-lg border border-border bg-white p-2"
              />
              {enrolling.secret ? (
                <p className="break-all text-center text-xs text-muted-foreground">
                  Chave manual: {enrolling.secret}
                </p>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="mfa-code">Código do autenticador</Label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={busy || code.trim().length < 6} onClick={() => void confirmEnroll()}>
                  Confirmar
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => setEnrolling(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" disabled={busy} onClick={() => void startEnroll()}>
              Ativar verificação em duas etapas
            </Button>
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      )}
    </SettingsSection>
  );
}
