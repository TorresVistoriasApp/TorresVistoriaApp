import { describe, expect, it } from "vitest";
import {
  isCanonicalInspectionPhotoPath,
  isCanonicalReportPath,
} from "@/modules/torres-vistoria/domain/legacy-migration";

const COMPANY = "00000000-0000-4000-8000-000000000001";
const INSPECTION = "11111111-1111-4111-8111-111111111111";

describe("legacy-migration path helpers", () => {
  it("aceita foto canônica", () => {
    const path = `${COMPANY}/${INSPECTION}/FRENTE_45_ESQUERDA/foto.webp`;
    expect(isCanonicalInspectionPhotoPath(path, COMPANY, INSPECTION)).toBe(true);
  });

  it("aceita thumbnail canônico", () => {
    const path = `${COMPANY}/${INSPECTION}/FRENTE_45_ESQUERDA/thumbs/foto.webp`;
    expect(isCanonicalInspectionPhotoPath(path, COMPANY, INSPECTION)).toBe(true);
  });

  it("rejeita path legado sem company_id", () => {
    const path = `${INSPECTION}/FRENTE_45_ESQUERDA/foto.webp`;
    expect(isCanonicalInspectionPhotoPath(path, COMPANY, INSPECTION)).toBe(false);
  });

  it("aceita laudo canônico e pending", () => {
    const canonical = `${COMPANY}/${INSPECTION}/laudo.pdf`;
    expect(isCanonicalReportPath(canonical, COMPANY, INSPECTION)).toBe(true);
    expect(isCanonicalReportPath("pending/draft.pdf", COMPANY, INSPECTION)).toBe(true);
  });
});
