import { create } from "zustand";
import type { SyncStatus } from "@/features/draft/types";

interface SyncStoreState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  setStatus: (status: SyncStatus) => void;
  setPendingCount: (count: number) => void;
  markSaving: () => void;
  markSynced: () => void;
  markPending: (count?: number) => void;
  markOffline: () => void;
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  status: "synced",
  pendingCount: 0,
  lastSyncedAt: null,
  setStatus: (status) => set({ status }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  markSaving: () => {
    if (get().status === "saving") return;
    set({ status: "saving" });
  },
  markSynced: () => {
    const state = get();
    if (state.status === "synced" && state.pendingCount === 0) return;
    set({
      status: "synced",
      pendingCount: 0,
      lastSyncedAt: new Date().toISOString(),
    });
  },
  markPending: (count) => {
    const nextCount = count ?? get().pendingCount;
    if (get().status === "pending" && get().pendingCount === nextCount) return;
    set({
      status: "pending",
      pendingCount: nextCount,
    });
  },
  markOffline: () => {
    if (get().status === "offline") return;
    set({ status: "offline" });
  },
}));
