import { describe, expect, it } from "vitest";
import {
  isHeicFile,
  isSupportedImageFile,
  pickWebpQuality,
  scaleDimensions,
} from "@/lib/compress-image";

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

  it("scaleDimensions só reduz quando ultrapassa o teto", () => {
    expect(scaleDimensions(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    expect(scaleDimensions(1920, 1080, 1920)).toEqual({ width: 1920, height: 1080 });

    const scaled = scaleDimensions(3840, 2160, 1920);
    expect(scaled.width).toBe(1920);
    expect(scaled.height).toBe(1080);
  });

  it("pickWebpQuality escolhe o primeiro degrau que cabe no limite", () => {
    expect(pickWebpQuality([3_000_000, 1_500_000, 900_000, 700_000], 2 * 1024 * 1024)).toBe(0.8);
    expect(pickWebpQuality([500_000, 400_000, 300_000, 200_000], 2 * 1024 * 1024)).toBe(0.85);
    expect(pickWebpQuality([5_000_000, 4_000_000, 3_500_000, 3_000_000], 2 * 1024 * 1024)).toBe(0.72);
  });
});
