import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

const typeStyles = {
  default: "border-border bg-background text-foreground",
  success: "border-success/30 bg-success/10 text-foreground",
  error: "border-destructive/30 bg-destructive/10 text-foreground",
  warning: "border-warning/30 bg-warning/10 text-foreground",
} as const;

export function ToastViewport() {
  const toasts = useUiStore((s) => s.toasts);
  const dismissToast = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
            typeStyles[item.type],
          )}
          role="status"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar notificação"
            onClick={() => dismissToast(item.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
