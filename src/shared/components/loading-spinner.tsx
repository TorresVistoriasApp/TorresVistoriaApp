import { Loader2 } from "lucide-react";

export function LoadingSpinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Loader2 className="relative h-9 w-9 animate-spin text-primary" aria-hidden strokeWidth={2} />
      </div>
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
