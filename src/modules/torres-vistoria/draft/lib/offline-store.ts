import {
  ACTIVE_DRAFT_STORAGE_KEY,
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OFFLINE_STORES,
} from "@/modules/torres-vistoria/draft/lib/constants";
import {
  isPhotoSyncClaimHeld,
  PHOTO_SYNC_CLAIM_TTL_MS,
} from "@/modules/torres-vistoria/domain/photos/photo-assets";

export type PendingInspectionUpdate = {
  inspectionId: string;
  payload: Record<string, unknown>;
  updatedAt: string;
};

export type PendingPhotoUpload = {
  id: string;
  inspectionId: string;
  tenantId: string;
  category: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  uploadedBy?: string | null;
  createdAt: string;
  /** Lock local entre abas do mesmo browser. Não atravessa dispositivos. */
  syncClaimedAt?: string | null;
};

export type LocalFormSnapshot = {
  inspectionId: string;
  data: Record<string, unknown>;
  updatedAt: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORES.inspectionUpdates)) {
        db.createObjectStore(OFFLINE_STORES.inspectionUpdates, { keyPath: "inspectionId" });
      }
      if (!db.objectStoreNames.contains(OFFLINE_STORES.photoUploads)) {
        db.createObjectStore(OFFLINE_STORES.photoUploads, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(OFFLINE_STORES.formSnapshots)) {
        db.createObjectStore(OFFLINE_STORES.formSnapshots, { keyPath: "inspectionId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir IndexedDB"));
  });
}

function runTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDb().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = fn(store);

        tx.oncomplete = () => {
          if (request && "result" in request) {
            resolve((request as IDBRequest<T>).result);
          } else {
            resolve();
          }
        };
        tx.onerror = () => reject(tx.error ?? new Error("Erro na transação IndexedDB"));
      }),
  );
}

export const offlineStore = {
  async saveInspectionUpdate(entry: PendingInspectionUpdate): Promise<void> {
    await runTransaction(OFFLINE_STORES.inspectionUpdates, "readwrite", (store) => {
      store.put(entry);
    });
  },

  async getInspectionUpdate(inspectionId: string): Promise<PendingInspectionUpdate | null> {
    const result = await runTransaction<PendingInspectionUpdate>(
      OFFLINE_STORES.inspectionUpdates,
      "readonly",
      (store) => store.get(inspectionId),
    );
    return (result as PendingInspectionUpdate | undefined) ?? null;
  },

  async listInspectionUpdates(): Promise<PendingInspectionUpdate[]> {
    const result = await runTransaction<PendingInspectionUpdate[]>(
      OFFLINE_STORES.inspectionUpdates,
      "readonly",
      (store) => store.getAll(),
    );
    return (result as PendingInspectionUpdate[] | undefined) ?? [];
  },

  async removeInspectionUpdate(inspectionId: string): Promise<void> {
    await runTransaction(OFFLINE_STORES.inspectionUpdates, "readwrite", (store) => {
      store.delete(inspectionId);
    });
  },

  async queuePhotoUpload(entry: PendingPhotoUpload): Promise<void> {
    await runTransaction(OFFLINE_STORES.photoUploads, "readwrite", (store) => {
      store.put(entry);
    });
  },

  async listPhotoUploads(): Promise<PendingPhotoUpload[]> {
    const result = await runTransaction<PendingPhotoUpload[]>(
      OFFLINE_STORES.photoUploads,
      "readonly",
      (store) => store.getAll(),
    );
    return (result as PendingPhotoUpload[] | undefined) ?? [];
  },

  async removePhotoUpload(id: string): Promise<void> {
    await runTransaction(OFFLINE_STORES.photoUploads, "readwrite", (store) => {
      store.delete(id);
    });
  },

  /**
   * Reserva o item na IndexedDB (transação única). Duas abas no mesmo origin
   * não processam o mesmo id ao mesmo tempo. Dispositivos distintos não compartilham IDB.
   */
  async tryClaimPhotoUpload(id: string, now = new Date()): Promise<PendingPhotoUpload | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OFFLINE_STORES.photoUploads, "readwrite");
      const store = tx.objectStore(OFFLINE_STORES.photoUploads);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const entry = getReq.result as PendingPhotoUpload | undefined;
        if (!entry) {
          resolve(null);
          return;
        }
        if (isPhotoSyncClaimHeld(entry.syncClaimedAt, now.getTime(), PHOTO_SYNC_CLAIM_TTL_MS)) {
          resolve(null);
          return;
        }
        const claimed: PendingPhotoUpload = {
          ...entry,
          syncClaimedAt: now.toISOString(),
        };
        store.put(claimed);
        tx.oncomplete = () => resolve(claimed);
      };
      getReq.onerror = () => reject(getReq.error ?? new Error("Falha ao reservar upload offline"));
      tx.onerror = () => reject(tx.error ?? new Error("Falha ao reservar upload offline"));
    });
  },

  async releasePhotoUploadClaim(id: string): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(OFFLINE_STORES.photoUploads, "readwrite");
      const store = tx.objectStore(OFFLINE_STORES.photoUploads);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const entry = getReq.result as PendingPhotoUpload | undefined;
        if (!entry) {
          resolve();
          return;
        }
        store.put({ ...entry, syncClaimedAt: null });
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Falha ao liberar reserva offline"));
    });
  },

  async saveFormSnapshot(entry: LocalFormSnapshot): Promise<void> {
    await runTransaction(OFFLINE_STORES.formSnapshots, "readwrite", (store) => {
      store.put(entry);
    });
  },

  async getFormSnapshot(inspectionId: string): Promise<LocalFormSnapshot | null> {
    const result = await runTransaction<LocalFormSnapshot>(
      OFFLINE_STORES.formSnapshots,
      "readonly",
      (store) => store.get(inspectionId),
    );
    return (result as LocalFormSnapshot | undefined) ?? null;
  },

  async removeFormSnapshot(inspectionId: string): Promise<void> {
    await runTransaction(OFFLINE_STORES.formSnapshots, "readwrite", (store) => {
      store.delete(inspectionId);
    });
  },

  async countPending(): Promise<number> {
    const [updates, photos] = await Promise.all([
      this.listInspectionUpdates(),
      this.listPhotoUploads(),
    ]);
    return updates.length + photos.length;
  },

  /** Apaga rascunhos e filas locais — chamado no logout (LGPD / troca de conta). */
  async clearAll(): Promise<void> {
    await Promise.all([
      runTransaction(OFFLINE_STORES.inspectionUpdates, "readwrite", (store) => {
        store.clear();
      }),
      runTransaction(OFFLINE_STORES.photoUploads, "readwrite", (store) => {
        store.clear();
      }),
      runTransaction(OFFLINE_STORES.formSnapshots, "readwrite", (store) => {
        store.clear();
      }),
    ]);
    try {
      localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY);
    } catch {
      // localStorage pode estar indisponível (modo privado restrito)
    }
  },
};
