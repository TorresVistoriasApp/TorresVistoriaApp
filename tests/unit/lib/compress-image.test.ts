import { describe, expect, it } from "vitest";
import { isHeicFile, isSupportedImageFile } from "@/lib/compress-image";

describe("compress-image helpers", () => {
  it("detecta HEIC pelo tipo ou extensão", () => {
    expect(isHeicFile(new File([], "foto.heic", { type: "image/heic" }))).toBe(true);
    expect(isHeicFile(new File([], "foto.jpg", { type: "image/jpeg" }))).toBe(false);
  });

  it("aceita formatos comuns da galeria", () => {
    expect(isSupportedImageFile(new File([], "foto.jpg", { type: "image/jpeg" }))).toBe(true);
    expect(isSupportedImageFile(new File([], "foto.png", { type: "image/png" }))).toBe(true);
    expect(isSupportedImageFile(new File([], "foto.heic", { type: "" }))).toBe(true);
    expect(isSupportedImageFile(new File([], "doc.pdf", { type: "application/pdf" }))).toBe(false);
  });
});
