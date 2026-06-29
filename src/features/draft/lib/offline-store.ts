import {
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OFFLINE_STORES,
} from "@/features/draft/lib/constants";

export type PendingInspectionUpdate = {
  inspectionId: string;
  payload: Record<string, unknown>;
  updatedAt: string;
};

export type PendingPhotoUpload = {
  id: string;
  inspectionId: string;
  companyId: string;
  category: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  uploadedBy?: string | null;
  createdAt: string;
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
};
