import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSyncStore } from "@/features/draft/stores/sync-store";
import { useNetworkStatus } from "@/features/draft/hooks/use-network-status";
import { flushOfflineQueue, getPendingSyncCount } from "@/features/draft/lib/sync-queue";
import { syncLogger } from "@/features/draft/lib/sync-logger";

export function useOfflineSyncEngine() {
  const online = useNetworkStatus();
  const markOffline = useSyncStore((s) => s.markOffline);
  const markPending = useSyncStore((s) => s.markPending);
  const markSynced = useSyncStore((s) => s.markSynced);
  const markSaving = useSyncStore((s) => s.markSaving);

  useEffect(() => {
    let cancelled = false;

    async function refreshPendingCount() {
      const count = await getPendingSyncCount();
      if (cancelled) return;

      if (!online) {
        markOffline();
        if (count > 0) markPending(count);
        return;
      }

      if (count === 0) {
        markSynced();
        return;
      }

      markPending(count);
    }

    void refreshPendingCount();
    return () => {
      cancelled = true;
    };
  }, [online, markOffline, markPending, markSynced]);

  useEffect(() => {
    if (!online) return;

    let cancelled = false;

    async function syncWhenOnline() {
      const pending = await getPendingSyncCount();
      if (cancelled || pending === 0) return;

      markSaving();
      syncLogger.info("Reconexão detectada — iniciando sincronização");

      const result = await flushOfflineQueue({
        onProgress: (remaining) => {
          if (remaining > 0) markPending(remaining);
        },
      });

      if (cancelled) return;

      if (result.failed > 0) {
        markPending(await getPendingSyncCount());
        return;
      }

      markSynced();
      syncLogger.info("Sincronização concluída", result);
    }

    void syncWhenOnline();
    return () => {
      cancelled = true;
    };
  }, [online, markPending, markSaving, markSynced]);
}

export function useSyncStatus() {
  return useSyncStore(
    useShallow((s) => ({
      status: s.status,
      pendingCount: s.pendingCount,
      lastSyncedAt: s.lastSyncedAt,
    })),
  );
}
