import { sha256Hex } from "./verification-code.ts";
import type { OfficialInspection } from "./inspection-row.ts";

export type ChecklistDigestRow = {
  id: string;
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
};

/** Snapshot canônico da vistoria — fonte de verdade no servidor para amarrar o PDF. */
export async function buildLaudoContentDigest(input: {
  inspection: OfficialInspection & { id: string; tenant_id: string; updated_at?: string | null };
  checklist: ChecklistDigestRow[];
  photoCount: number;
  verificationCode: string;
  nextVersion: number;
}): Promise<string> {
  const checklistCanon = [...input.checklist]
    .sort((a, b) => `${a.category}:${a.item_name}`.localeCompare(`${b.category}:${b.item_name}`))
    .map((row) => ({
      id: row.id,
      category: row.category,
      item_name: row.item_name,
      status: row.status,
      notes: row.notes ?? "",
    }));

  const payload = {
    inspectionId: input.inspection.id,
    tenantId: input.inspection.tenant_id,
    updatedAt: input.inspection.updated_at ?? null,
    verificationCode: input.verificationCode,
    nextVersion: input.nextVersion,
    photoCount: input.photoCount,
    inspection: {
      inspection_number: input.inspection.inspection_number,
      inspection_date: input.inspection.inspection_date,
      plate: input.inspection.plate,
      chassis: input.inspection.chassis,
      renavam: input.inspection.renavam,
      brand: input.inspection.brand,
      model: input.inspection.model,
      opinion: input.inspection.opinion,
      technical_notes: input.inspection.technical_notes,
    },
    checklist: checklistCanon,
  };

  return sha256Hex(JSON.stringify(payload));
}

export { pdfContainsBindingMarkers } from "./pdf-binding-markers.ts";
