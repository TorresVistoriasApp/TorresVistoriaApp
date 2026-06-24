import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="gradient-mesh flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          <Loader2 className="relative h-9 w-9 animate-spin text-accent" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium tracking-wide">Carregando Torres Vistoria...</p>
      </div>
    </div>
  );
}
