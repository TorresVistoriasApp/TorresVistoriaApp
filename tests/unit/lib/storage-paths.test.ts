import { describe, expect, it } from "vitest";
import {
  buildInspectionPhotoPath,
  buildInspectionPhotoThumbnailPath,
  buildReportStoragePath,
} from "@/lib/storage-paths";

const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const INSPECTION_ID = "95968fbc-36d7-4e21-a4ad-dabc9390c390";

describe("storage-paths", () => {
  it("monta path canônico de foto", () => {
    expect(
      buildInspectionPhotoPath(COMPANY_ID, INSPECTION_ID, "DOC_VEICULO", "1785433814833.webp"),
    ).toBe(
      `${COMPANY_ID}/${INSPECTION_ID}/DOC_VEICULO/1785433814833.webp`,
    );
  });

  it("monta path de thumbnail na subpasta thumbs/", () => {
    const full = buildInspectionPhotoPath(
      COMPANY_ID,
      INSPECTION_ID,
      "EXT_FRENTE_45_ESQ",
      "1785433880162-zk65is.webp",
    );
    expect(buildInspectionPhotoThumbnailPath(full)).toBe(
      `${COMPANY_ID}/${INSPECTION_ID}/EXT_FRENTE_45_ESQ/thumbs/1785433880162-zk65is.webp`,
    );
  });

  it("monta path canônico de laudo PDF", () => {
    expect(
      buildReportStoragePath(COMPANY_ID, INSPECTION_ID, "1782385084320-laudo-4-QKJ0F33.pdf"),
    ).toBe(
      `${COMPANY_ID}/${INSPECTION_ID}/1782385084320-laudo-4-QKJ0F33.pdf`,
    );
  });
});
