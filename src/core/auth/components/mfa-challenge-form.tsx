import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { FormError } from "@/core/auth/components/form-error";

export function MfaChallengeForm({
  onVerify,
  onCancel,
}: {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => Promise<void> | void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="mfa-challenge-code">Código do autenticador</Label>
        <Input
          id="mfa-challenge-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="000000"
          autoFocus
        />
      </div>
      {error ? <FormError message={error} /> : null}
      <Button type="submit" className="h-12 w-full" size="lg" disabled={busy || code.trim().length < 6}>
        {busy ? "Verificando..." : "Confirmar código"}
      </Button>
      <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => void onCancel()}>
        Cancelar e sair
      </Button>
    </form>
  );
}

export function MfaChallengeScreen({
  onVerify,
  onCancel,
}: {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => Promise<void> | void;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Verificação em duas etapas
            </p>
            <h1 className="mt-1 text-lg font-bold text-foreground">Confirme o acesso</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Abra o aplicativo autenticador e informe o código de 6 dígitos.
            </p>
          </div>
        </div>
        <MfaChallengeForm onVerify={onVerify} onCancel={onCancel} />
      </div>
    </div>
  );
}
