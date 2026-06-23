import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <LoadingSpinner label={label ?? "Carregando Torres Vistoria..."} />
    </div>
  );
}

/** @deprecated Use LoadingSpinner */
export function LoadingSpinnerLegacy() {
  return <LoadingSpinner />;
}
