import { useCallback } from "react";
import { useUiStore, type ToastType } from "@/stores/ui-store";

type ToastInput =
  | string
  | {
      title: string;
      description?: string;
      type?: ToastType;
    };

export function useToast() {
  const addToast = useUiStore((s) => s.addToast);
  const dismissToast = useUiStore((s) => s.dismissToast);
  const toasts = useUiStore((s) => s.toasts);

  const toast = useCallback(
    (input: ToastInput) => {
      if (typeof input === "string") {
        addToast({ title: input, type: "default" });
        return;
      }
      addToast({
        title: input.title,
        description: input.description,
        type: input.type ?? "default",
      });
    },
    [addToast],
  );

  return { toasts, toast, dismiss: dismissToast };
}
