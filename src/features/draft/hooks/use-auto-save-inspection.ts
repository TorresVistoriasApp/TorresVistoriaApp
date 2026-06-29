import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AUTO_SAVE_DEBOUNCE_MS,
  AUTO_SAVE_INTERVAL_MS,
} from "@/features/draft/lib/constants";
import { offlineStore } from "@/features/draft/lib/offline-store";
import { queueInspectionUpdate } from "@/features/draft/lib/sync-queue";
import { computeInspectionCompletionPercent } from "@/features/draft/lib/completion-percent";
import { draftService } from "@/features/draft/services/draft-service";
import { useNetworkStatus } from "@/features/draft/hooks/use-network-status";
import { useSyncStore } from "@/features/draft/stores/sync-store";
import type { VistoriaInput, VistoriaUpdateInput } from "@/schemas/vistoria";
import { vistoriaDraftSchema } from "@/schemas/vistoria";

type AutoSaveOptions = {
  inspectionId: string;
  enabled?: boolean;
  photosCount?: number;
  checklistEvaluatedRatio?: number;
};

function sanitizeDraftPayload(data: Partial<VistoriaInput>): Partial<VistoriaUpdateInput> {
  const parsed = vistoriaDraftSchema.safeParse(data);
  if (!parsed.success) return data as Partial<VistoriaUpdateInput>;
  return parsed.data as Partial<VistoriaUpdateInput>;
}

export function useAutoSaveInspection({
  inspectionId,
  enabled = true,
}: AutoSaveOptions) {
  const online = useNetworkStatus();
  const markSaving = useSyncStore((s) => s.markSaving);
  const markSynced = useSyncStore((s) => s.markSynced);
  const markPending = useSyncStore((s) => s.markPending);
  const markOffline = useSyncStore((s) => s.markOffline);

  const dirtyRef = useRef(false);
  const lastPayloadRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<VistoriaInput>) => {
      const payload = sanitizeDraftPayload(data);
      const completionPercent = computeInspectionCompletionPercent({ inspection: data });

      await offlineStore.saveFormSnapshot({
        inspectionId,
        data: payload as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      });

      if (!online) {
        await queueInspectionUpdate(inspectionId, {
          ...payload,
          completion_percent: completionPercent,
        });
        markOffline();
        markPending();
        return { offline: true as const };
      }

      markSaving();
      await draftService.autoSave(inspectionId, payload, completionPercent);
      await offlineStore.removeInspectionUpdate(inspectionId);
      markSynced();
      return { offline: false as const };
    },
  });

  const mutateAsyncRef = useRef(saveMutation.mutateAsync);
  mutateAsyncRef.current = saveMutation.mutateAsync;

  const persist = useCallback(
    (data: Partial<VistoriaInput>) => {
      const serialized = JSON.stringify(data);
      if (serialized === lastPayloadRef.current) return;

      lastPayloadRef.current = serialized;
      dirtyRef.current = false;
      void mutateAsyncRef.current(data).catch(() => {
        markPending();
      });
    },
    [markPending],
  );

  const scheduleSave = useCallback(
    (data: Partial<VistoriaInput>) => {
      dirtyRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(data), AUTO_SAVE_DEBOUNCE_MS);
    },
    [persist],
  );

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (!dirtyRef.current || !lastPayloadRef.current) return;
      persist(JSON.parse(lastPayloadRef.current) as Partial<VistoriaInput>);
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, persist]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return {
    scheduleSave,
    saveNow: persist,
    isSaving: saveMutation.isPending,
  };
}
