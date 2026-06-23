import { create } from "zustand";

interface InspectionDraft {
  plate?: string;
  brand?: string;
  model?: string;
  client_name?: string;
  client_document?: string;
}

interface InspectionStoreState {
  draftId: string | null;
  draftInspection: InspectionDraft | null;
  setDraftId: (id: string | null) => void;
  setDraftInspection: (draft: InspectionDraft | null) => void;
  updateDraft: (data: InspectionDraft) => void;
  clearDraft: () => void;
}

export const useInspectionStore = create<InspectionStoreState>((set) => ({
  draftId: null,
  draftInspection: null,
  setDraftId: (draftId) => set({ draftId }),
  setDraftInspection: (draftInspection) => set({ draftInspection }),
  updateDraft: (data) =>
    set((state) => ({
      draftInspection: state.draftInspection
        ? { ...state.draftInspection, ...data }
        : data,
    })),
  clearDraft: () => set({ draftId: null, draftInspection: null }),
}));
