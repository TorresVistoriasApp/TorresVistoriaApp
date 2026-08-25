import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden strokeWidth={2} />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="gradient-mesh flex min-h-dvh items-center justify-center">
      <LoadingSpinner label={label ?? "Carregando Torres Vistoria..."} />
    </div>
  );
}

/** @deprecated Use LoadingSpinner */
export function LoadingSpinnerLegacy() {
  return <LoadingSpinner />;
}
