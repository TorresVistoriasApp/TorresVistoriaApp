import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useInspectionChecklist } from "@/hooks/use-checklist";
import { useInspection } from "@/hooks/use-inspection-detail";
import { useInspectionPhotos } from "@/hooks/use-photos";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionDetail } from "@/services/inspection-service";
import type { InspectionPhoto } from "@/services/photo-service";

export interface InspectionContextValue {
  inspectionId: string;
  inspection: InspectionDetail | null;
  photos: InspectionPhoto[];
  checklist: ChecklistItem[];
  isLoading: boolean;
  isLoadingPhotos: boolean;
  isLoadingChecklist: boolean;
  isLoadingAny: boolean;
  error: Error | null;
  refetchInspection: () => Promise<unknown>;
  refetchPhotos: () => Promise<unknown>;
  refetchChecklist: () => Promise<unknown>;
}

const InspectionContext = createContext<InspectionContextValue | undefined>(undefined);

interface InspectionProviderProps {
  inspectionId: string;
  children: ReactNode;
}

/** Escopo da vistoria atual — evita repetir hooks em cada sub-rota. */
export function InspectionProvider({ inspectionId, children }: InspectionProviderProps) {
  const inspectionQuery = useInspection(inspectionId);
  const photosQuery = useInspectionPhotos(inspectionId);
  const checklistQuery = useInspectionChecklist(inspectionId);

  const value = useMemo<InspectionContextValue>(
    () => ({
      inspectionId,
      inspection: inspectionQuery.data ?? null,
      photos: photosQuery.data ?? [],
      checklist: checklistQuery.data ?? [],
      isLoading: inspectionQuery.isLoading,
      isLoadingPhotos: photosQuery.isLoading,
      isLoadingChecklist: checklistQuery.isLoading,
      isLoadingAny:
        inspectionQuery.isLoading || photosQuery.isLoading || checklistQuery.isLoading,
      error: (inspectionQuery.error as Error | null) ?? null,
      refetchInspection: inspectionQuery.refetch,
      refetchPhotos: photosQuery.refetch,
      refetchChecklist: checklistQuery.refetch,
    }),
    [
      inspectionId,
      inspectionQuery.data,
      inspectionQuery.isLoading,
      inspectionQuery.error,
      inspectionQuery.refetch,
      photosQuery.data,
      photosQuery.isLoading,
      photosQuery.refetch,
      checklistQuery.data,
      checklistQuery.isLoading,
      checklistQuery.refetch,
    ],
  );

  return <InspectionContext.Provider value={value}>{children}</InspectionContext.Provider>;
}

export function useInspectionContext() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error("useInspectionContext deve ser usado dentro de InspectionProvider");
  }
  return context;
}

/** Retorna null fora do escopo de vistoria (ex.: listagem). */
export function useOptionalInspectionContext(): InspectionContextValue | null {
  return useContext(InspectionContext) ?? null;
}
