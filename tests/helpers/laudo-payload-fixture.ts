import { ChecklistStatus, InspectionOpinion } from "@/modules/torres-vistoria/domain/enums";
import { CHECKLIST_CATALOG } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { LaudoPayload, LaudoPhoto } from "@/modules/torres-vistoria/domain/laudo/laudo-model";

const PHOTO_KEYS = [
  "EXT_FRENTE_45_ESQ",
  "EXT_FRENTE_45_DIR",
  "EXT_LATERAL_ESQ",
  "EXT_LATERAL_DIR",
  "EXT_TRASEIRA_45_ESQ",
  "DOC_VEICULO",
  "MOT_COMPARTIMENTO",
  "IDV_NUMERO_CHASSI",
] as const;

export function buildChecklistFixture(): ChecklistItem[] {
  const rows: ChecklistItem[] = [];
  for (const category of CHECKLIST_CATALOG) {
    for (const item of category.items) {
      rows.push({
        id: `chk-${category.key}-${item.key}`,
        tenant_id: "tenant-p2",
        inspection_id: "insp-p2",
        category: category.key,
        item_name: item.name,
        status: ChecklistStatus.CONFORME,
        notes: null,
        created_at: "2026-09-24T00:00:00Z",
        updated_at: "2026-09-24T00:00:00Z",
      });
    }
  }
  return rows;
}

export function buildPhotosFixture(count: number, dataUrl: string): LaudoPhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    tenant_id: "tenant-p2",
    inspection_id: "insp-p2",
    category: PHOTO_KEYS[index % PHOTO_KEYS.length],
    storage_path: `tenant-p2/insp-p2/${PHOTO_KEYS[index % PHOTO_KEYS.length]}/${index}.webp`,
    public_url: dataUrl,
    thumbnail_url: null,
    display_name: `Foto ${index + 1}`,
    captured_at: "2026-09-24T12:00:00Z",
    created_at: "2026-09-24T12:00:00Z",
    dataUrl,
  }));
}

export function buildLaudoPayloadFixture(
  photoCount: number,
  dataUrl: string,
  overrides: Partial<LaudoPayload> = {},
): LaudoPayload {
  const checklist = buildChecklistFixture();
  const photos = buildPhotosFixture(photoCount, dataUrl);
  return {
    inspection: {
      id: "insp-p2",
      tenant_id: "tenant-p2",
      inspector_id: "user-p2",
      inspection_number: 148,
      inspection_date: "2026-09-24",
      inspection_time: "10:00",
      location: "São Paulo",
      inspection_purpose: "Compra",
      inspection_type_id: null,
      requester_name: null,
      requester_document: null,
      buyer_name: null,
      buyer_document: null,
      seller_name: null,
      seller_document: null,
      judicial_process: null,
      judicial_court: null,
      judicial_district: null,
      client_name: "Cliente P2",
      client_document: "12345678901",
      client_phone: null,
      client_email: null,
      plate: "ABC1D23",
      chassis: "CHASSIS-P2-FIXTURE",
      renavam: "12345678901",
      motor_number: null,
      vehicle_uf: "SP",
      registration_city_uf: "São Paulo/SP",
      vehicle_category: null,
      vehicle_species: null,
      passenger_capacity: 5,
      power_cv: 110,
      engine_displacement: 1600,
      brand: "VW",
      model: "Gol",
      version: "1.0",
      color: "Prata",
      fuel: "Flex",
      manufacture_year: 2020,
      model_year: 2021,
      mileage: 45000,
      situation: "Regular",
      opinion: InspectionOpinion.APROVADO,
      technical_notes: "Vistoria de benchmark P.2.",
      internal_notes: null,
      market_fipe_value: 55000,
      market_average_value: 54000,
      insurance_acceptance_percent: 90,
      vehicle_condition: "Bom",
      is_armored: false,
      status: "IN_PROGRESS",
      completion_percent: 100,
      draft_expires_at: null,
      last_auto_saved_at: null,
      created_at: "2026-09-24T00:00:00Z",
      updated_at: "2026-09-24T00:00:00Z",
    },
    checklist,
    photos,
    laudoNumber: "TV-2026-000148",
    verificationCode: "TV-ABCD-EFGH-IJKL",
    integrityHash: "digest-placeholder",
    contentDigest: "a".repeat(64),
    validationUrl: "https://app.example/validar/TV-ABCD-EFGH-IJKL",
    generatedAt: new Date("2026-09-24T12:00:00Z"),
    ...overrides,
  };
}
