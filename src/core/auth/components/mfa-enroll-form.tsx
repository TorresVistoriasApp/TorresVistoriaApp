import { useState } from "react";
import { db } from "@/infra/supabase/client";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { FormError } from "@/core/auth/components/form-error";

export function MfaEnrollForm({
  onEnrolled,
}: {
  onEnrolled?: () => void | Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qr: string;
    secret: string;
  } | null>(null);

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
      await onEnrolled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  if (!enrolling) {
    return (
      <div className="space-y-3">
        <Button type="button" className="h-12 w-full" size="lg" disabled={busy} onClick={() => void startEnroll()}>
          {busy ? "Preparando..." : "Ativar verificação em duas etapas"}
        </Button>
        {error ? <FormError message={error} /> : null}
      </div>
    );
  }

  return (
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
        <Label htmlFor="mfa-enroll-code">Código do autenticador</Label>
        <Input
          id="mfa-enroll-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </div>
      {error ? <FormError message={error} /> : null}
      <Button
        type="button"
        className="h-12 w-full"
        size="lg"
        disabled={busy || code.trim().length < 6}
        onClick={() => void confirmEnroll()}
      >
        {busy ? "Confirmando..." : "Confirmar"}
      </Button>
    </div>
  );
}
