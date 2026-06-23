import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Carregando Torres Vistoria...</p>
      </div>
    </div>
  );
}
