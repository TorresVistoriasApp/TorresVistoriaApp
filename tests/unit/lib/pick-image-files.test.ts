import { describe, expect, it } from "vitest";
import { partitionSupportedFiles } from "@/lib/pick-image-files";

describe("pick-image-files", () => {
  it("separa arquivos suportados dos rejeitados", () => {
    const files = [
      new File([], "foto.jpg", { type: "image/jpeg" }),
      new File([], "doc.pdf", { type: "application/pdf" }),
    ];

    const result = partitionSupportedFiles(files);
    expect(result.files).toHaveLength(1);
    expect(result.rejectedCount).toBe(1);
  });

  it("aceita imagens sem MIME type mas com extensão válida", () => {
    const result = partitionSupportedFiles([new File([], "foto.heic", { type: "" })]);
    expect(result.files).toHaveLength(1);
    expect(result.rejectedCount).toBe(0);
  });
});
